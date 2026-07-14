import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { deleteMedia } from "@/lib/api/media";
import { uploadMedia } from "@/lib/media/uploadMedia";
import { withUploadedMedia } from "@/lib/media/withUploadedMedia";

vi.mock("@/lib/api/media", () => ({
  deleteMedia: vi.fn(),
}));

vi.mock("@/lib/media/uploadMedia", () => ({
  uploadMedia: vi.fn(),
}));

const mockedUploadMedia =
  vi.mocked(uploadMedia);
const mockedDeleteMedia =
  vi.mocked(deleteMedia);

describe("withUploadedMedia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("commits without uploading when no file is selected", async () => {
    const commit = vi
      .fn()
      .mockResolvedValue("created");

    const result =
      await withUploadedMedia({
        file: null,
        purpose: "EVENT_IMAGE",
        commit,
      });

    expect(result).toBe("created");
    expect(mockedUploadMedia)
      .not.toHaveBeenCalled();
    expect(commit)
      .toHaveBeenCalledWith(undefined);
    expect(mockedDeleteMedia)
      .not.toHaveBeenCalled();
  });

  it("passes the uploaded media ID to the entity mutation", async () => {
    const file = new File(
      ["image"],
      "cover.png",
      { type: "image/png" },
    );

    mockedUploadMedia
      .mockResolvedValue(
        "11111111-1111-1111-1111-111111111111",
      );

    const commit = vi
      .fn()
      .mockResolvedValue("created");

    await withUploadedMedia({
      file,
      purpose: "EVENT_IMAGE",
      commit,
    });

    expect(commit).toHaveBeenCalledWith(
      "11111111-1111-1111-1111-111111111111",
    );

    expect(mockedDeleteMedia)
      .not.toHaveBeenCalled();
  });

  it("deletes an uploaded asset when the entity mutation fails", async () => {
    const file = new File(
      ["image"],
      "cover.png",
      { type: "image/png" },
    );

    mockedUploadMedia
      .mockResolvedValue(
        "22222222-2222-2222-2222-222222222222",
      );

    const failure =
      new Error("create failed");

    await expect(
      withUploadedMedia({
        file,
        purpose: "EVENT_IMAGE",
        commit: async () => {
          throw failure;
        },
      }),
    ).rejects.toBe(failure);

    expect(mockedDeleteMedia)
      .toHaveBeenCalledWith(
        "22222222-2222-2222-2222-222222222222",
      );
  });
});
