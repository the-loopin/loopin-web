import apiClient from "./client";
import type {
  UserRegisterRequest,
  UserResponse,
  AuthResponse,
  DevLoginRequest,
} from "./contracts";

export async function registerUser(payload: UserRegisterRequest): Promise<UserResponse> {
  const response = await apiClient.post<UserResponse>("/users/register", payload);
  return response.data;
}

export async function googleLogin(idToken: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/google", { idToken });
  return response.data;
}

export async function devLogin(
  payload: DevLoginRequest,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/auth/dev-login",
    payload,
  );

  return response.data;
}
