import apiClient from "./client";
import type { UserResponse } from "./contracts";
import { encodeApiIdentifier } from "./path";

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>("/users/me");
  return response.data;
}

// Keep stubs for unused hooks/caller compatibility
export async function getUsers(): Promise<UserResponse[]> {
  const response = await apiClient.get<UserResponse[]>("/users");
  return response.data;
}

export async function getUserById(userId: string): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>(`/users/${encodeApiIdentifier(userId, "userId")}`);
  return response.data;
}

export async function getUserProfile(userId: string): Promise<UserResponse> {
  return getUserById(userId);
}