import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { SESSION_TOKEN_COOKIE_NAME } from "@/lib/auth/constants";
import { clearServerSession } from "@/lib/auth/server-session";
import { buildBackendApiUrl } from "@/lib/security/backend";
import {
  forbiddenResponse,
  isTrustedBrowserRequest,
} from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPSTREAM_TIMEOUT_MS = 30_000;
const MAX_REQUEST_BODY_BYTES = 25 * 1024 * 1024;
const MUTATING_METHODS = new Set([
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);
const BLOCKED_PATHS = [
  "auth/google",
  "auth/dev-login",
  "dev/",
];
const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "content-type",
  "if-match",
  "if-none-match",
  "if-modified-since",
  "x-idempotency-key",
];
const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "content-disposition",
  "etag",
  "last-modified",
];

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

function errorResponse(
  status: number,
  code: string,
  message: string,
): NextResponse {
  return NextResponse.json(
    { code, message },
    {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache",
        Vary: "Cookie",
      },
    },
  );
}

function safeErrorString(
  value: unknown,
  fallback: string,
  maximumLength: number,
): string {
  return typeof value === "string" && value.length > 0
    ? value.slice(0, maximumLength)
    : fallback;
}

function sanitizeFieldErrors(
  value: unknown,
): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const fieldErrors: Record<string, string> = {};

  for (const [key, fieldMessage] of Object.entries(value).slice(0, 25)) {
    if (
      key === "__proto__" ||
      key === "constructor" ||
      key === "prototype" ||
      key.length === 0 ||
      key.length > 100 ||
      typeof fieldMessage !== "string"
    ) {
      continue;
    }

    fieldErrors[key] = fieldMessage.slice(0, 300);
  }

  return Object.keys(fieldErrors).length > 0
    ? fieldErrors
    : undefined;
}

async function sanitizedUpstreamErrorResponse(
  upstreamResponse: Response,
): Promise<NextResponse> {
  const contentType = upstreamResponse.headers.get("content-type");
  const payload = contentType
    ?.toLowerCase()
    .includes("application/json")
    ? ((await upstreamResponse.json().catch(() => null)) as
        | Record<string, unknown>
        | null)
    : null;
  const status = upstreamResponse.status;
  const fallbackCode =
    status === 401
      ? "UNAUTHORIZED"
      : status === 403
        ? "FORBIDDEN"
        : status === 404
          ? "NOT_FOUND"
          : status === 409
            ? "CONFLICT"
            : status === 429
              ? "RATE_LIMITED"
              : "API_REQUEST_FAILED";
  const responseBody = {
    code: safeErrorString(
      payload?.code ?? payload?.error,
      fallbackCode,
      80,
    ),
    message: safeErrorString(
      payload?.message ?? payload?.detail,
      "The API request failed.",
      300,
    ),
    fieldErrors: sanitizeFieldErrors(payload?.fieldErrors),
  };
  const response = NextResponse.json(responseBody, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      Pragma: "no-cache",
      Vary: "Cookie",
      "X-Content-Type-Options": "nosniff",
    },
  });

  if (status === 401) {
    clearServerSession(response);
  }

  return response;
}

function isBlockedPath(path: string): boolean {
  return BLOCKED_PATHS.some(
    (blockedPath) =>
      path === blockedPath || path.startsWith(blockedPath),
  );
}

async function readRequestBody(
  request: NextRequest,
): Promise<ArrayBuffer | undefined> {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  const declaredLength = Number(
    request.headers.get("content-length") ?? 0,
  );

  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_REQUEST_BODY_BYTES
  ) {
    throw new RangeError("Request body is too large.");
  }

  const body = await request.arrayBuffer();

  if (body.byteLength > MAX_REQUEST_BODY_BYTES) {
    throw new RangeError("Request body is too large.");
  }

  return body.byteLength > 0 ? body : undefined;
}

async function proxyRequest(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  if (
    MUTATING_METHODS.has(request.method) &&
    !isTrustedBrowserRequest(request)
  ) {
    return forbiddenResponse();
  }

  const { path } = await context.params;
  const normalizedPath = path.join("/");

  if (isBlockedPath(normalizedPath)) {
    return errorResponse(404, "NOT_FOUND", "Not found.");
  }

  let targetUrl: URL;

  try {
    targetUrl = buildBackendApiUrl(
      path,
      request.nextUrl.search,
    );
  } catch {
    return errorResponse(
      400,
      "BAD_REQUEST",
      "Invalid API path.",
    );
  }

  let body: ArrayBuffer | undefined;

  try {
    body = await readRequestBody(request);
  } catch (error) {
    if (error instanceof RangeError) {
      return errorResponse(
        413,
        "PAYLOAD_TOO_LARGE",
        error.message,
      );
    }

    return errorResponse(
      400,
      "BAD_REQUEST",
      "Could not read the request body.",
    );
  }

  const requestHeaders = new Headers();

  for (const headerName of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(headerName);

    if (value) {
      requestHeaders.set(headerName, value);
    }
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(
    SESSION_TOKEN_COOKIE_NAME,
  )?.value;

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers: requestHeaders,
      body,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return errorResponse(
      503,
      "API_UNAVAILABLE",
      "The API service is unavailable.",
    );
  }

  if (
    upstreamResponse.status >= 300 &&
    upstreamResponse.status < 400
  ) {
    return errorResponse(
      502,
      "UNEXPECTED_UPSTREAM_REDIRECT",
      "The API returned an unexpected redirect.",
    );
  }

  if (!upstreamResponse.ok) {
    return sanitizedUpstreamErrorResponse(upstreamResponse);
  }

  const responseHeaders = new Headers({
    "Cache-Control": "private, no-store, max-age=0",
    Pragma: "no-cache",
    Vary: "Cookie",
    "X-Content-Type-Options": "nosniff",
  });

  for (const headerName of FORWARDED_RESPONSE_HEADERS) {
    const value = upstreamResponse.headers.get(headerName);

    if (value) {
      responseHeaders.set(headerName, value);
    }
  }

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export function GET(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyRequest(request, context);
}

export function POST(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyRequest(request, context);
}

export function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyRequest(request, context);
}

export function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyRequest(request, context);
}

export function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyRequest(request, context);
}
