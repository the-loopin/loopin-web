import { describe, expect, it } from "vitest";
import { assertEventImageContract } from "@/lib/media/eventImageContract";

describe("event image contract", () => {
  it("does not create an unattached media asset when the API only supports imageUrl", () => {
    const file = new File(["image"], "cover.png", { type: "image/png" });

    expect(() => assertEventImageContract(file)).toThrow(/attaching media to an event/i);
  });

  it("allows an event submission with no local upload", () => {
    expect(() => assertEventImageContract(null)).not.toThrow();
  });
});
