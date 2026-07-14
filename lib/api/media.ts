import apiClient from "./client";
import type {
  RequestMediaUploadRequest,
  MediaUploadResponse,
  MediaCompletionResponse,
} from "./contracts";

export async function requestMediaUpload(
  payload: RequestMediaUploadRequest
): Promise<MediaUploadResponse> {
  const response = await apiClient.post<MediaUploadResponse>("/media/uploads", payload);
  return response.data;
}

export async function completeMediaUpload(
  mediaId: string
): Promise<MediaCompletionResponse> {
  const response = await apiClient.post<MediaCompletionResponse>(
    `/media/uploads/${mediaId}/complete`
  );
  return response.data;
}

export async function deleteMedia(mediaId: string): Promise<void> {
  await apiClient.delete(`/media/${mediaId}`);
}
