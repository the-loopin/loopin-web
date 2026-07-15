import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  LEGACY_ROLE_COOKIE_NAME,
  LEGACY_TOKEN_COOKIE_NAME,
  SESSION_ROLE_COOKIE_NAME,
  SESSION_TOKEN_COOKIE_NAME,
} from "./constants";

const DEFAULT_SESSION_SECONDS = 60 * 60;
const MAX_SESSION_SECONDS = 60 * 60 * 8;
const ROLE_PATTERN = /^[A-Z][A-Z0-9_]{0,31}$/;

function decodeJwtExpiry(token: string): number | null {
  const payloadSegment = token.split(".")[1];

  if (!payloadSegment) {
    return null;
  }

  try {
    const normalized = payloadSegment
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payloadSegment.length / 4) * 4, "=");
    const payload = JSON.parse(
      Buffer.from(normalized, "base64").toString("utf8"),
    ) as { exp?: unknown };

    return typeof payload.exp === "number"
      ? payload.exp
      : null;
  } catch {
    return null;
  }
}

function getSessionMaxAge(token: string): number {
  const expiry = decodeJwtExpiry(token);

  if (!expiry) {
    return DEFAULT_SESSION_SECONDS;
  }

  const remainingSeconds = Math.floor(
    expiry - Date.now() / 1000,
  );

  return Math.max(
    1,
    Math.min(remainingSeconds, MAX_SESSION_SECONDS),
  );
}

export function normalizeServerRole(role: string): string | null {
  const normalizedRole = role.trim().toUpperCase();
  return ROLE_PATTERN.test(normalizedRole) ? normalizedRole : null;
}

export function setServerSession(
  response: NextResponse,
  token: string,
  role: string,
): void {
  const normalizedRole = normalizeServerRole(role);

  if (
    token.length === 0 ||
    token.length > 3800 ||
    /[\u0000-\u001F\u007F]/.test(token) ||
    !normalizedRole
  ) {
    throw new Error("Invalid authentication response.");
  }

  const maxAge = getSessionMaxAge(token);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
    priority: "high" as const,
  };

  response.cookies.set(
    SESSION_TOKEN_COOKIE_NAME,
    token,
    cookieOptions,
  );
  response.cookies.set(
    SESSION_ROLE_COOKIE_NAME,
    normalizedRole,
    cookieOptions,
  );

  response.cookies.delete(LEGACY_TOKEN_COOKIE_NAME);
  response.cookies.delete(LEGACY_ROLE_COOKIE_NAME);
}

export function clearServerSession(
  response: NextResponse,
): void {
  const cookieNames = new Set([
    SESSION_TOKEN_COOKIE_NAME,
    SESSION_ROLE_COOKIE_NAME,
    LEGACY_TOKEN_COOKIE_NAME,
    LEGACY_ROLE_COOKIE_NAME,
  ]);

  for (const cookieName of cookieNames) {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      secure:
        cookieName.startsWith("__Host-") ||
        process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
  }
}

export async function getServerAuthToken(): Promise<
  string | null
> {
  const cookieStore = await cookies();
  return (
    cookieStore.get(SESSION_TOKEN_COOKIE_NAME)?.value ??
    null
  );
}
