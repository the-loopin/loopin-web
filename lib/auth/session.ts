export const SESSION_TOKEN_COOKIE_NAME = "loopin-auth-token";

function getDocumentCookieValue(cookieName: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${cookieName}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
}

export function getAuthToken(): string | null {
  return getDocumentCookieValue(SESSION_TOKEN_COOKIE_NAME);
}

export function setAuthToken(token: string): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${SESSION_TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; samesite=lax`;
}

export function clearAuthToken(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${SESSION_TOKEN_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}