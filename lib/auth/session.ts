"use client";

import {
  LEGACY_ROLE_COOKIE_NAME,
  LEGACY_TOKEN_COOKIE_NAME,
} from "./constants";

export { SESSION_TOKEN_COOKIE_NAME } from "./constants";

const SESSION_MARKER_KEY = "loopin-session-present";
const SESSION_ROLE_KEY = "loopin-session-role";
const SESSION_MARKER_VALUE = "1";
const AUTH_SESSION_PLACEHOLDER = "http-only-session";
const ROLE_PATTERN = /^[A-Z][A-Z0-9_]{0,31}$/;

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function removeLegacyClientCredentials(): void {
  const storage = getStorage();

  try {
    storage?.removeItem("token");
    storage?.removeItem("role");
  } catch {
    // Storage can be unavailable in privacy-restricted browsers.
  }

  if (typeof document !== "undefined") {
    document.cookie = `${LEGACY_TOKEN_COOKIE_NAME}=; path=/; max-age=0; samesite=strict`;
    document.cookie = `${LEGACY_ROLE_COOKIE_NAME}=; path=/; max-age=0; samesite=strict`;
  }
}

function normalizeRole(role: string): string | null {
  const normalizedRole = role.trim().toUpperCase();
  return ROLE_PATTERN.test(normalizedRole) ? normalizedRole : null;
}

/**
 * Compatibility helper used by existing UI code as a boolean session marker.
 * The actual JWT is stored only in an HttpOnly server cookie and is never
 * returned here.
 */
export function getAuthToken(): string | null {
  const storage = getStorage();

  try {
    return storage?.getItem(SESSION_MARKER_KEY) ===
      SESSION_MARKER_VALUE
      ? AUTH_SESSION_PLACEHOLDER
      : null;
  } catch {
    return null;
  }
}

/**
 * Marks that a server-managed session exists. The token contents are
 * validated for presence but never persisted by client JavaScript.
 */
export function setAuthToken(token: string): void {
  if (token.length === 0) {
    return;
  }
  const storage = getStorage();
  removeLegacyClientCredentials();

  try {
    storage?.setItem(
      SESSION_MARKER_KEY,
      SESSION_MARKER_VALUE,
    );
  } catch {
    // The HttpOnly cookie remains authoritative even without local storage.
  }
}

export function setAuthRole(role: string): void {
  const storage = getStorage();
  const normalizedRole = normalizeRole(role);

  try {
    if (normalizedRole) {
      storage?.setItem(SESSION_ROLE_KEY, normalizedRole);
    } else {
      storage?.removeItem(SESSION_ROLE_KEY);
    }

    storage?.removeItem("role");
  } catch {
    // Role is only a non-authoritative UI hint.
  }
}

export function getAuthRole(): string | null {
  const storage = getStorage();

  try {
    const role = storage?.getItem(SESSION_ROLE_KEY);
    return role ? normalizeRole(role) : null;
  } catch {
    return null;
  }
}

export function clearAuthToken(): void {
  const storage = getStorage();

  try {
    storage?.removeItem(SESSION_MARKER_KEY);
    storage?.removeItem(SESSION_ROLE_KEY);
  } catch {
    // Continue with server logout even if storage is unavailable.
  }

  removeLegacyClientCredentials();

  if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV !== "test"
  ) {
    void fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      keepalive: true,
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    }).catch(() => undefined);
  }
}

export async function getWebSocketAuthToken(): Promise<string> {
  const response = await fetch("/api/auth/ws-token", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | { token?: unknown }
    | null;

  if (
    !response.ok ||
    typeof payload?.token !== "string" ||
    payload.token.length === 0
  ) {
    throw new Error("WebSocket authentication failed");
  }

  return payload.token;
}
