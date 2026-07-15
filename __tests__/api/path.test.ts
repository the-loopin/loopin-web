import { describe, expect, it } from "vitest";

import {
  encodeApiIdentifier,
  normalizeApiIdentifier,
} from "@/lib/api/path";

describe("API path identifiers", () => {
  it("accepts UUID-like identifiers", () => {
    expect(
      normalizeApiIdentifier(
        " 11111111-1111-1111-1111-111111111111 ",
        "eventId",
      ),
    ).toBe("11111111-1111-1111-1111-111111111111");
  });

  it.each([
    "../admin",
    "group/member",
    "https://evil.example",
    "identifier with space",
    "id?admin=true",
    "id#fragment",
    "id\\member",
    "",
  ])("rejects unsafe identifier %s", (value) => {
    expect(() =>
      encodeApiIdentifier(value, "groupId"),
    ).toThrow("groupId is invalid");
  });
});
