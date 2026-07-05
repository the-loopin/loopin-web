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
  const cookieToken = getDocumentCookieValue(SESSION_TOKEN_COOKIE_NAME);

  if (cookieToken) {
    return cookieToken;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("token");
}

export function setAuthToken(token: string): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${SESSION_TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; samesite=lax`;
  window.localStorage.setItem("token", token);
}

export function setAuthRole(role: string): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `loopin-role=${encodeURIComponent(role.toLowerCase())}; path=/; samesite=lax`;
  window.localStorage.setItem("role", role);
}

export function getAuthRole(): string | null {
  const cookieRole = getDocumentCookieValue("loopin-role");

  if (cookieRole) {
    return cookieRole;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("role");
}

export function clearAuthToken(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${SESSION_TOKEN_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
  document.cookie = "loopin-role=; path=/; max-age=0; samesite=lax";
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("role");
}
