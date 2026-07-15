import { beforeEach, describe, expect, it } from "vitest";

import {
  clearAuthToken,
  getAuthRole,
  getAuthToken,
  setAuthRole,
  setAuthToken,
} from "@/lib/auth/session";

describe("client auth session compatibility helpers", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie =
      "loopin-auth-token=; path=/; max-age=0";
    document.cookie =
      "loopin-role=; path=/; max-age=0";
  });

  it("never persists the JWT in browser-readable storage", () => {
    setAuthToken("secret.jwt.value");

    expect(window.localStorage.getItem("token")).toBeNull();
    expect(document.cookie).not.toContain("secret.jwt.value");
    expect(getAuthToken()).toBe("http-only-session");
  });

  it("keeps only a normalized non-authoritative role hint", () => {
    setAuthRole(" admin ");

    expect(getAuthRole()).toBe("ADMIN");
    expect(window.localStorage.getItem("role")).toBeNull();
  });

  it("clears client markers and legacy credentials", () => {
    setAuthToken("secret.jwt.value");
    setAuthRole("USER");

    clearAuthToken();

    expect(getAuthToken()).toBeNull();
    expect(getAuthRole()).toBeNull();
    expect(window.localStorage.getItem("token")).toBeNull();
    expect(window.localStorage.getItem("role")).toBeNull();
  });
});
