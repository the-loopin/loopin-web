import apiClient from "./client";

export async function getBadges(): Promise<string[]> {
  const response = await apiClient.get<string[]>("/me/badges");
  return response.data;
}
