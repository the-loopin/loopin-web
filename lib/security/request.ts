import { NextRequest, NextResponse } from "next/server";

const MAX_JSON_BODY_BYTES = 32 * 1024;

export function isTrustedBrowserRequest(
  request: NextRequest,
): boolean {
  const requestedWith = request.headers.get(
    "x-requested-with",
  );

  if (requestedWith !== "XMLHttpRequest") {
    return false;
  }

  const fetchSite = request.headers.get("sec-fetch-site");

  if (
    fetchSite &&
    fetchSite !== "same-origin" &&
    fetchSite !== "none"
  ) {
    return false;
  }

  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

export function forbiddenResponse(): NextResponse {
  return NextResponse.json(
    {
      code: "FORBIDDEN",
      message: "The request origin could not be verified.",
    },
    {
      status: 403,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function readLimitedJsonBody(
  request: NextRequest,
): Promise<unknown> {
  const contentType = request.headers.get("content-type");

  if (
    !contentType
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    throw new Error("Expected an application/json body.");
  }

  const declaredLength = Number(
    request.headers.get("content-length") ?? 0,
  );

  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_JSON_BODY_BYTES
  ) {
    throw new Error("Request body is too large.");
  }

  const text = await request.text();

  if (new TextEncoder().encode(text).byteLength > MAX_JSON_BODY_BYTES) {
    throw new Error("Request body is too large.");
  }

  return JSON.parse(text) as unknown;
}
