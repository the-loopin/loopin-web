import apiClient from "./client";
import type { InterestResponse } from "./contracts";
import { normalizeApiIdentifier } from "./path";

export async function getAvailableInterests(): Promise<InterestResponse[]> {
  const response = await apiClient.get<InterestResponse[]>("/interests");
  return response.data;
}

export async function getMyInterests(): Promise<InterestResponse[]> {
  const response = await apiClient.get<InterestResponse[]>("/me/interests");
  return response.data;
}

export async function updateMyInterests(interestIds: string[]): Promise<InterestResponse[]> {
  // Map raw interestIds string[] to UserInterestRequest object list for the backend DTO
  const interestsPayload = interestIds.map((id) => ({
    interestId: normalizeApiIdentifier(id, "interestId"),
  }));
  const response = await apiClient.put<InterestResponse[]>("/me/interests", {
    interests: interestsPayload,
  });
  return response.data;
}
