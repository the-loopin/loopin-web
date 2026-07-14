import apiClient from "./client";
import type {
  UpdateUserAvatarRequest,
  UpdateUserProfileRequest,
  UserProfileResponse,
} from "./contracts";

export async function getProfile():
Promise<UserProfileResponse> {
  const response =
    await apiClient.get<UserProfileResponse>(
      "/me",
    );

  return response.data;
}

export async function updateProfile(
  payload: UpdateUserProfileRequest,
): Promise<UserProfileResponse> {
  const response =
    await apiClient.put<UserProfileResponse>(
      "/me",
      payload,
    );

  return response.data;
}

export async function updateProfileAvatar(
  mediaId: string,
): Promise<UserProfileResponse> {
  const payload: UpdateUserAvatarRequest = {
    mediaId,
  };

  const response =
    await apiClient.put<UserProfileResponse>(
      "/me/avatar",
      payload,
    );

  return response.data;
}

export async function removeProfileAvatar():
Promise<UserProfileResponse> {
  const response =
    await apiClient.delete<UserProfileResponse>(
      "/me/avatar",
    );

  return response.data;
}
