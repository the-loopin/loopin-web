import type { MediaPurpose } from "@/lib/api/contracts";
import { deleteMedia } from "@/lib/api/media";

import { uploadMedia } from "./uploadMedia";

export interface WithUploadedMediaOptions<T> {
  file: File | null;
  purpose: MediaPurpose;
  commit: (
    mediaId: string | undefined,
  ) => Promise<T>;
}

async function deleteMediaQuietly(
  mediaId: string,
): Promise<void> {
  try {
    await deleteMedia(mediaId);
  } catch {
    // Cleanup failure must not replace the original entity mutation error.
  }
}

/**
 * Uploads a media asset, commits the owning entity, and deletes the
 * uploaded asset if the entity mutation fails.
 */
export async function withUploadedMedia<T>({
  file,
  purpose,
  commit,
}: WithUploadedMediaOptions<T>): Promise<T> {
  let uploadedMediaId: string | undefined;

  try {
    if (file) {
      uploadedMediaId = await uploadMedia(
        file,
        purpose,
      );
    }

    const result = await commit(
      uploadedMediaId,
    );

    uploadedMediaId = undefined;

    return result;
  } catch (error) {
    if (uploadedMediaId) {
      await deleteMediaQuietly(
        uploadedMediaId,
      );
    }

    throw error;
  }
}