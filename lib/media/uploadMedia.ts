import {
  completeMediaUpload,
  type MediaPurpose,
  requestMediaUpload,
} from "@/lib/api/loopin";

const supportedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const maximumSizes: Record<MediaPurpose, number> = {
  EVENT_IMAGE: 5 * 1024 * 1024,
  GROUP_IMAGE: 5 * 1024 * 1024,
  PROFILE_AVATAR: 2 * 1024 * 1024,
};

export async function uploadMedia(
  file: File,
  purpose: MediaPurpose,
): Promise<string> {
  const contentType = file.type.trim().toLowerCase();

  if (!supportedImageTypes.has(contentType)) {
    throw new Error(
      "Only JPEG, PNG and WebP images are supported.",
    );
  }

  if (file.size <= 0) {
    throw new Error("The selected file is empty.");
  }

  const maximumSize = maximumSizes[purpose];

  if (file.size > maximumSize) {
    const maximumSizeInMiB =
      maximumSize / 1024 / 1024;

    throw new Error(
      `The image must not exceed ${maximumSizeInMiB} MiB.`,
    );
  }

  const upload = await requestMediaUpload({
    purpose,
    fileName: file.name,
    contentType,
    sizeBytes: file.size,
  });

  const storageResponse = await fetch(
    upload.uploadUrl,
    {
      method: "PUT",
      headers: upload.requiredHeaders,
      body: file,
    },
  );

  if (!storageResponse.ok) {
    throw new Error(
      `Image upload failed with status ${storageResponse.status}.`,
    );
  }

  const completion = await completeMediaUpload(
    upload.mediaId,
  );

  if (
    completion.status !== "UPLOADED" &&
    completion.status !== "ATTACHED"
  ) {
    throw new Error(
      `Unexpected media status: ${completion.status}`,
    );
  }

  return completion.mediaId;
}