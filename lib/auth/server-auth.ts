import { NextRequest, NextResponse } from "next/server";

import { buildBackendApiUrl } from "../security/backend";
import { readLimitedJsonBody } from "../security/request";
import { normalizeServerRole, setServerSession } from "./server-session";

const UPSTREAM_TIMEOUT_MS = 15_000;

type AuthenticationPayload = {
  token?: unknown;
  role?: unknown;
};


function sanitizeAuthenticationPayload(
  endpoint: string[],
  payload: unknown,
): Record<string, string> | null {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    return null;
  }

  const body = payload as Record<string, unknown>;
  const endpointPath = endpoint.join("/");

  if (endpointPath === "auth/google") {
    const idToken = body.idToken;

    if (
      typeof idToken !== "string" ||
      idToken.length < 100 ||
      idToken.length > 10_000 ||
      /[\u0000-\u001F\u007F]/.test(idToken)
    ) {
      return null;
    }

    return { idToken };
  }

  if (endpointPath === "auth/dev-login") {
    if (typeof body.email !== "string") {
      return null;
    }

    const email = body.email.trim();

    if (
      email.length === 0 ||
      email.length > 254 ||
      !email.includes("@") ||
      /[\u0000-\u001F\u007F]/.test(email)
    ) {
      return null;
    }

    return { email };
  }

  return null;
}

function noStoreHeaders(): Record<string, string> {
  return {
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
    Vary: "Cookie",
  };
}

function safeErrorPayload(payload: unknown): {
  code: string;
  message: string;
} {
  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    const message =
      typeof body.message === "string"
        ? body.message
        : typeof body.detail === "string"
          ? body.detail
          : "Authentication failed.";
    const code =
      typeof body.code === "string"
        ? body.code
        : typeof body.error === "string"
          ? body.error
          : "AUTHENTICATION_FAILED";

    return {
      code: code.slice(0, 80),
      message: message.slice(0, 300),
    };
  }

  return {
    code: "AUTHENTICATION_FAILED",
    message: "Authentication failed.",
  };
}

export async function authenticateWithBackend(
  request: NextRequest,
  endpoint: string[],
): Promise<NextResponse> {
  let requestBody: unknown;

  try {
    requestBody = await readLimitedJsonBody(request);
  } catch (error) {
    return NextResponse.json(
      {
        code: "BAD_REQUEST",
        message:
          error instanceof Error
            ? error.message
            : "Invalid request body.",
      },
      {
        status: 400,
        headers: noStoreHeaders(),
      },
    );
  }

  const sanitizedBody = sanitizeAuthenticationPayload(
    endpoint,
    requestBody,
  );

  if (!sanitizedBody) {
    return NextResponse.json(
      {
        code: "BAD_REQUEST",
        message: "Invalid authentication request.",
      },
      {
        status: 400,
        headers: noStoreHeaders(),
      },
    );
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(
      buildBackendApiUrl(endpoint),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedBody),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      },
    );
  } catch {
    return NextResponse.json(
      {
        code: "AUTH_SERVICE_UNAVAILABLE",
        message: "Authentication service is unavailable.",
      },
      {
        status: 503,
        headers: noStoreHeaders(),
      },
    );
  }

  const payload = (await upstreamResponse
    .json()
    .catch(() => null)) as AuthenticationPayload | null;

  if (!upstreamResponse.ok) {
    return NextResponse.json(safeErrorPayload(payload), {
      status: upstreamResponse.status,
      headers: noStoreHeaders(),
    });
  }

  const token = payload?.token;
  const role = payload?.role;
  const normalizedRole =
    typeof role === "string"
      ? normalizeServerRole(role)
      : null;

  if (
    typeof token !== "string" ||
    !normalizedRole
  ) {
    return NextResponse.json(
      {
        code: "INVALID_AUTH_RESPONSE",
        message: "Authentication service returned an invalid response.",
      },
      {
        status: 502,
        headers: noStoreHeaders(),
      },
    );
  }

  const response = NextResponse.json(
    {
      authenticated: true,
      role: normalizedRole,
    },
    {
      status: 200,
      headers: noStoreHeaders(),
    },
  );

  try {
    setServerSession(response, token, normalizedRole);
  } catch {
    return NextResponse.json(
      {
        code: "INVALID_AUTH_RESPONSE",
        message: "Authentication service returned an invalid response.",
      },
      {
        status: 502,
        headers: noStoreHeaders(),
      },
    );
  }

  return response;
}
