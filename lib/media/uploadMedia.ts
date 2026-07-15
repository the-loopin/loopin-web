import type { MediaPurpose } from "@/lib/api/contracts";
import {
  completeMediaUpload,
  deleteMedia,
  requestMediaUpload,
} from "@/lib/api/media";
import { normalizeApiIdentifier } from "@/lib/api/path";

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

const FORBIDDEN_UPLOAD_HEADERS = new Set([
  "authorization",
  "cookie",
  "host",
  "proxy-authorization",
]);

function isPrivateIpv4(hostname: string): boolean {
  const octets = hostname.split(".").map(Number);

  if (
    octets.length !== 4 ||
    octets.some(
      (octet) =>
        !Number.isInteger(octet) ||
        octet < 0 ||
        octet > 255,
    )
  ) {
    return false;
  }

  const [first, second] = octets;

  return (
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    first === 0
  );
}

function isPrivateHostname(hostname: string): boolean {
  const normalizedHostname = hostname
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .toLowerCase();

  return (
    normalizedHostname === "localhost" ||
    normalizedHostname === "::1" ||
    normalizedHostname.endsWith(".localhost") ||
    normalizedHostname.endsWith(".local") ||
    (normalizedHostname.includes(":") &&
      (normalizedHostname.startsWith("fc") ||
        normalizedHostname.startsWith("fd") ||
        normalizedHostname.startsWith("fe80:"))) ||
    isPrivateIpv4(normalizedHostname)
  );
}


function getAllowedUploadHostnames(): Set<string> {
  return new Set(
    (process.env.NEXT_PUBLIC_MEDIA_UPLOAD_HOSTS ?? "")
      .split(",")
      .map((hostname) => hostname.trim().toLowerCase())
      .filter(
        (hostname) =>
          hostname.length > 0 &&
          !hostname.includes("/") &&
          !hostname.includes("\\") &&
          !hostname.includes(":") &&
          !/[\u0000-\u0020\u007F]/.test(hostname),
      ),
  );
}

function getSafeUploadUrl(uploadUrl: string): string {
  let url: URL;

  try {
    url = new URL(uploadUrl);
  } catch {
    throw new Error("The media registry returned an invalid upload URL.");
  }

  if (url.username || url.password) {
    throw new Error(
      "The media upload URL must not contain embedded credentials.",
    );
  }

  if (!new Set(["http:", "https:"]).has(url.protocol)) {
    throw new Error("The media upload URL uses an invalid protocol.");
  }

  if (process.env.NODE_ENV === "production") {
    const allowedHostnames = getAllowedUploadHostnames();
    const normalizedHostname = url.hostname.toLowerCase();

    if (allowedHostnames.size === 0) {
      throw new Error(
        "NEXT_PUBLIC_MEDIA_UPLOAD_HOSTS must be configured in production.",
      );
    }

    if (
      url.protocol !== "https:" ||
      isPrivateHostname(normalizedHostname) ||
      !allowedHostnames.has(normalizedHostname)
    ) {
      throw new Error(
        "The media upload URL is not allowed in production.",
      );
    }
  }

  url.hash = "";
  return url.toString();
}

function getSafeUploadHeaders(
  requiredHeaders: unknown,
): Headers {
  const headers = new Headers();

  if (requiredHeaders == null) {
    return headers;
  }

  if (
    typeof requiredHeaders !== "object" ||
    Array.isArray(requiredHeaders)
  ) {
    throw new Error("The media registry returned invalid upload headers.");
  }

  for (const [rawName, rawValue] of Object.entries(
    requiredHeaders as Record<string, unknown>,
  )) {
    const name = rawName.trim().toLowerCase();

    if (
      !name ||
      FORBIDDEN_UPLOAD_HEADERS.has(name) ||
      name.startsWith("x-forwarded-") ||
      /[\u0000-\u001F\u007F]/.test(rawName)
    ) {
      throw new Error(
        "The media registry returned a forbidden upload header.",
      );
    }

    if (
      typeof rawValue !== "string" ||
      /[\u0000-\u001F\u007F]/.test(rawValue)
    ) {
      throw new Error("The media registry returned invalid upload headers.");
    }

    headers.set(name, rawValue);
  }

  return headers;
}

async function deleteMediaQuietly(
  mediaId: string,
): Promise<void> {
  try {
    await deleteMedia(mediaId);
  } catch {
    // Cleanup is best effort. Preserve the original upload error.
  }
}

export async function uploadMedia(
  file: File,
  purpose: MediaPurpose,
): Promise<string> {
  const contentType =
    file.type.trim().toLowerCase();

  if (!supportedImageTypes.has(contentType)) {
    throw new Error(
      "Only JPEG, PNG and WebP images are supported.",
    );
  }

  if (file.size <= 0) {
    throw new Error(
      "The selected file is empty.",
    );
  }

  const maximumSize = maximumSizes[purpose];

  if (file.size > maximumSize) {
    const maximumSizeInMiB =
      maximumSize / 1024 / 1024;

    throw new Error(
      `The image must not exceed ${maximumSizeInMiB} MiB.`,
    );
  }

  let mediaId: string | undefined;

  try {
    const upload = await requestMediaUpload({
      purpose,
      fileName: file.name,
      contentType,
      sizeBytes: file.size,
    });

    if (!upload.uploadUrl) {
      throw new Error(
        "Missing upload URL from media registry.",
      );
    }

    if (!upload.mediaId) {
      throw new Error(
        "Missing media ID from media registry.",
      );
    }

    mediaId = normalizeApiIdentifier(
      upload.mediaId,
      "mediaId",
    );
    const safeUploadUrl = getSafeUploadUrl(upload.uploadUrl);
    const safeHeaders = getSafeUploadHeaders(
      upload.requiredHeaders,
    );

    const storageResponse = await fetch(
      safeUploadUrl,
      {
        method: "PUT",
        headers: safeHeaders,
        body: file,
        credentials: "omit",
        redirect: "error",
        referrerPolicy: "no-referrer",
        cache: "no-store",
      },
    );

    if (!storageResponse.ok) {
      throw new Error(
        `Image upload failed with status ${storageResponse.status}.`,
      );
    }

    const completion =
      await completeMediaUpload(mediaId);

    if (
      completion.status !== "UPLOADED" &&
      completion.status !== "ATTACHED"
    ) {
      throw new Error(
        `Unexpected media status: ${completion.status}`,
      );
    }

    if (!completion.mediaId) {
      throw new Error(
        "Media completion did not return a valid media ID.",
      );
    }

    return normalizeApiIdentifier(
      completion.mediaId,
      "mediaId",
    );
  } catch (error) {
    if (mediaId) {
      await deleteMediaQuietly(mediaId);
    }

    throw error;
  }
}
