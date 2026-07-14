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
