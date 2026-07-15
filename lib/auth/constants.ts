const isProduction = process.env.NODE_ENV === "production";

export const SESSION_TOKEN_COOKIE_NAME = isProduction
  ? "__Host-loopin-session"
  : "loopin-session";

export const SESSION_ROLE_COOKIE_NAME = isProduction
  ? "__Host-loopin-session-role"
  : "loopin-session-role";

export const LEGACY_TOKEN_COOKIE_NAME = "loopin-auth-token";
export const LEGACY_ROLE_COOKIE_NAME = "loopin-role";
