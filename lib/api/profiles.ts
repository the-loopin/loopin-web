import apiClient from "./client";
import type {
  UserProfileResponse,
  UpdateUserProfileRequest,
} from "./contracts";

export async function getProfile(): Promise<UserProfileResponse> {
  const response = await apiClient.get<UserProfileResponse>("/me");
  return response.data;
}

export async function updateProfile(payload: UpdateUserProfileRequest): Promise<UserProfileResponse> {
  const response = await apiClient.put<UserProfileResponse>("/me", payload);
  return response.data;
}


