import apiClient from "./client";
import type {
  UserRegisterRequest,
  UserResponse,
  AuthResponse,
  DevLoginRequest,
} from "./contracts";
import { ApiException } from "./errors";

const SESSION_PLACEHOLDER_TOKEN = "http-only-session";
const ROLE_PATTERN = /^[A-Z][A-Z0-9_]{0,31}$/;

type SessionAuthenticationResponse = {
  authenticated?: unknown;
  role?: unknown;
  code?: unknown;
  message?: unknown;
};

async function authenticate(
  path: "/api/auth/google" | "/api/auth/dev",
  payload: unknown,
): Promise<AuthResponse> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as
    | SessionAuthenticationResponse
    | null;

  if (!response.ok) {
    throw new ApiException({
      status: response.status,
      code:
        typeof body?.code === "string"
          ? body.code.slice(0, 80)
          : "AUTHENTICATION_FAILED",
      message:
        typeof body?.message === "string"
          ? body.message.slice(0, 300)
          : "Authentication failed.",
    });
  }

  const role =
    typeof body?.role === "string"
      ? body.role.trim().toUpperCase()
      : "";

  if (
    body?.authenticated !== true ||
    !ROLE_PATTERN.test(role)
  ) {
    throw new ApiException({
      status: 502,
      code: "INVALID_AUTH_RESPONSE",
      message: "Authentication service returned an invalid response.",
    });
  }

  return {
    token: SESSION_PLACEHOLDER_TOKEN,
    role,
  } as AuthResponse;
}

export async function registerUser(
  payload: UserRegisterRequest,
): Promise<UserResponse> {
  const response = await apiClient.post<UserResponse>(
    "/users/register",
    payload,
  );
  return response.data;
}

export function googleLogin(
  idToken: string,
): Promise<AuthResponse> {
  return authenticate("/api/auth/google", { idToken });
}

export function devLogin(
  payload: DevLoginRequest,
): Promise<AuthResponse> {
  return authenticate("/api/auth/dev", payload);
}
