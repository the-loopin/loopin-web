import apiClient from "./client";
import type {
  RequestMediaUploadRequest,
  MediaUploadResponse,
  MediaCompletionResponse,
} from "./contracts";

import { encodeApiIdentifier } from "./path";

export async function requestMediaUpload(
  payload: RequestMediaUploadRequest
): Promise<MediaUploadResponse> {
  const response = await apiClient.post<MediaUploadResponse>("/media/uploads", payload);
  return response.data;
}

export async function completeMediaUpload(
  mediaId: string
): Promise<MediaCompletionResponse> {
  const encodedMediaId = encodeApiIdentifier(mediaId, "mediaId");
  const response = await apiClient.post<MediaCompletionResponse>(
    `/media/uploads/${encodedMediaId}/complete`
  );
  return response.data;
}

export async function deleteMedia(mediaId: string): Promise<void> {
  const encodedMediaId = encodeApiIdentifier(mediaId, "mediaId");
  await apiClient.delete(`/media/${encodedMediaId}`);
}
