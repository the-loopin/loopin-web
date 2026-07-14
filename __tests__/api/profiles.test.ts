import {
  describe,
  expect,
  it,
} from "vitest";
import {
  http,
  HttpResponse,
} from "msw";

import {
  removeProfileAvatar,
  updateProfileAvatar,
} from "@/lib/api/profiles";
import { server } from "../../vitest.setup";

describe("Profile avatar API", () => {
  it("attaches an uploaded avatar media ID", async () => {
    let body:
      | Record<string, unknown>
      | undefined;

    server.use(
      http.put(
        "/api/v1/me/avatar",
        async ({ request }) => {
          body =
            (await request.json()) as
              Record<string, unknown>;

          return HttpResponse.json({
            id: "user-id",
            avatar: {
              id: body.mediaId,
              contentType:
                "image/png",
              sizeBytes: 123,
            },
          });
        },
      ),
    );

    const result =
      await updateProfileAvatar(
        "33333333-3333-3333-3333-333333333333",
      );

    expect(body).toEqual({
      mediaId:
        "33333333-3333-3333-3333-333333333333",
    });

    expect(result.avatar?.id).toBe(
      "33333333-3333-3333-3333-333333333333",
    );
  });

  it("removes the current avatar", async () => {
    server.use(
      http.delete(
        "/api/v1/me/avatar",
        () =>
          HttpResponse.json({
            id: "user-id",
            avatar: null,
          }),
      ),
    );

    const result =
      await removeProfileAvatar();

    expect(result.avatar).toBeNull();
  });
});
