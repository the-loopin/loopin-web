import apiClient from "./client";
import type {
  UserRegisterRequest,
  UserResponse,
  AuthResponse,
} from "./contracts";

export async function registerUser(payload: UserRegisterRequest): Promise<UserResponse> {
  const response = await apiClient.post<UserResponse>("/users/register", payload);
  return response.data;
}

export async function googleLogin(idToken: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/google", { idToken });
  return response.data;
}

export interface DevLoginResult {
  accessToken: string;
  tokenType: string;
  userId: string;
  email: string;
}

export async function devLogin(email: string): Promise<DevLoginResult> {
  const response = await apiClient.post<DevLoginResult>("/dev/auth/login", { email });
  return response.data;
}
