import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  completeMediaUpload,
  deleteMedia,
  requestMediaUpload,
} from "@/lib/api/media";
import { uploadMedia } from "@/lib/media/uploadMedia";

vi.mock("@/lib/api/media", () => ({
  requestMediaUpload: vi.fn(),
  completeMediaUpload: vi.fn(),
  deleteMedia: vi.fn(),
}));

const mockedRequest =
  vi.mocked(requestMediaUpload);
const mockedComplete =
  vi.mocked(completeMediaUpload);
const mockedDelete =
  vi.mocked(deleteMedia);

describe("uploadMedia", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockedRequest.mockResolvedValue({
      mediaId:
        "55555555-5555-5555-5555-555555555555",
      uploadUrl:
        "https://storage.example/upload",
      requiredHeaders: {
        "Content-Type":
          "image/png",
      },
      expiresAt:
        "2026-08-01T12:00:00Z",
    });

    mockedComplete.mockResolvedValue({
      mediaId:
        "55555555-5555-5555-5555-555555555555",
      status: "UPLOADED",
    });
  });

  it("returns the completed media ID", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      }),
    );

    const file = new File(
      ["image"],
      "cover.png",
      { type: "image/png" },
    );

    await expect(
      uploadMedia(
        file,
        "EVENT_IMAGE",
      ),
    ).resolves.toBe(
      "55555555-5555-5555-5555-555555555555",
    );

    expect(mockedDelete)
      .not.toHaveBeenCalled();
  });

  it("deletes the registry asset when object storage upload fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    const file = new File(
      ["image"],
      "cover.png",
      { type: "image/png" },
    );

    await expect(
      uploadMedia(
        file,
        "EVENT_IMAGE",
      ),
    ).rejects.toThrow(
      "Image upload failed",
    );

    expect(mockedDelete)
      .toHaveBeenCalledWith(
        "55555555-5555-5555-5555-555555555555",
      );
  });

  it("deletes the registry asset when completion fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      }),
    );

    mockedComplete.mockRejectedValue(
      new Error("completion failed"),
    );

    const file = new File(
      ["image"],
      "cover.png",
      { type: "image/png" },
    );

    await expect(
      uploadMedia(
        file,
        "EVENT_IMAGE",
      ),
    ).rejects.toThrow(
      "completion failed",
    );

    expect(mockedDelete)
      .toHaveBeenCalledWith(
        "55555555-5555-5555-5555-555555555555",
      );
  });
});

// Security regression coverage for presigned upload handling.
describe("uploadMedia security", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedRequest.mockResolvedValue({
      mediaId:
        "55555555-5555-5555-5555-555555555555",
      uploadUrl:
        "https://storage.example/upload",
      requiredHeaders: {
        "Content-Type": "image/png",
      },
      expiresAt:
        "2026-08-01T12:00:00Z",
    });

    mockedComplete.mockResolvedValue({
      mediaId:
        "55555555-5555-5555-5555-555555555555",
      status: "UPLOADED",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("omits browser credentials and refuses upload redirects", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["image"], "cover.png", {
      type: "image/png",
    });

    await uploadMedia(file, "EVENT_IMAGE");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://storage.example/upload",
      expect.objectContaining({
        credentials: "omit",
        redirect: "error",
        referrerPolicy: "no-referrer",
        cache: "no-store",
      }),
    );
  });

  it("rejects upload URLs with embedded credentials", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    mockedRequest.mockResolvedValue({
      mediaId:
        "55555555-5555-5555-5555-555555555555",
      uploadUrl:
        "https://user:password@storage.example/upload",
      requiredHeaders: {
        "Content-Type": "image/png",
      },
      expiresAt:
        "2026-08-01T12:00:00Z",
    });

    const file = new File(["image"], "cover.png", {
      type: "image/png",
    });

    await expect(
      uploadMedia(file, "EVENT_IMAGE"),
    ).rejects.toThrow("embedded credentials");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockedDelete).toHaveBeenCalledWith(
      "55555555-5555-5555-5555-555555555555",
    );
  });

  it("rejects sensitive headers returned by the media registry", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    mockedRequest.mockResolvedValue({
      mediaId:
        "55555555-5555-5555-5555-555555555555",
      uploadUrl:
        "https://storage.example/upload",
      requiredHeaders: {
        Authorization: "Bearer attacker-controlled",
      },
      expiresAt:
        "2026-08-01T12:00:00Z",
    });

    const file = new File(["image"], "cover.png", {
      type: "image/png",
    });

    await expect(
      uploadMedia(file, "EVENT_IMAGE"),
    ).rejects.toThrow("forbidden upload header");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requires an exact upload-host allowlist in production", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv(
      "NEXT_PUBLIC_MEDIA_UPLOAD_HOSTS",
      "uploads.example.com",
    );

    const file = new File(["image"], "cover.png", {
      type: "image/png",
    });

    await expect(
      uploadMedia(file, "EVENT_IMAGE"),
    ).rejects.toThrow("not allowed in production");

    expect(fetchMock).not.toHaveBeenCalled();
  });

});
