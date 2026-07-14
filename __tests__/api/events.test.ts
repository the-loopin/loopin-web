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
  createEvent,
  getEvents,
  getMyLoopedEvents,
} from "@/lib/api/events";
import { server } from "../../vitest.setup";

const eventResponse = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Contract event",
  description: "Description",
  type: "EVENT",
  category: "TECH",
  city: "Baku",
  address: "Nizami Street",
  startDateTime:
    "2026-08-01T12:00:00",
  endDateTime:
    "2026-08-01T14:00:00",
  isFree: true,
  price: 0,
  organizerName: "Loopin",
  status: "PUBLISHED",
  interests: [],
};

describe("Events API", () => {
  it.each([
    "EVENT",
    "ACTIVITY",
  ] as const)(
    "sends the %s server-side type filter",
    async (type) => {
      let capturedUrl:
        | URL
        | undefined;

      server.use(
        http.get(
          "/api/v1/events",
          ({ request }) => {
            capturedUrl =
              new URL(request.url);

            return HttpResponse.json({
              content: [
                {
                  ...eventResponse,
                  type,
                },
              ],
              number: 2,
              size: 20,
              totalElements: 61,
              totalPages: 4,
              first: false,
              last: false,
            });
          },
        ),
      );

      const result =
        await getEvents({
          type,
          page: 2,
          size: 20,
          search: "test",
        });

      expect(
        capturedUrl?.searchParams.get(
          "type",
        ),
      ).toBe(type);

      expect(
        capturedUrl?.searchParams.get(
          "page",
        ),
      ).toBe("2");

      expect(
        capturedUrl?.searchParams.get(
          "size",
        ),
      ).toBe("20");

      expect(result.number).toBe(2);
      expect(result.totalElements)
        .toBe(61);
      expect(result.totalPages).toBe(4);
    },
  );

  it("sends imageMediaId in EventCreateRequest", async () => {
    let requestBody:
      | Record<string, unknown>
      | undefined;

    server.use(
      http.post(
        "/api/v1/events",
        async ({ request }) => {
          requestBody =
            (await request.json()) as
              Record<string, unknown>;

          return HttpResponse.json(
            {
              ...eventResponse,
              image: {
                id:
                  requestBody
                    .imageMediaId,
                contentType:
                  "image/png",
                sizeBytes: 123,
              },
            },
            { status: 201 },
          );
        },
      ),
    );

    await createEvent({
      title: "Contract event",
      description: "Description",
      type: "EVENT",
      category: "TECH",
      city: "Baku",
      address: "Nizami Street",
      latitude: 40.37,
      longitude: 49.89,
      startDateTime:
        "2026-08-01T12:00:00",
      endDateTime:
        "2026-08-01T14:00:00",
      isFree: true,
      price: 0,
      organizerName: "Loopin",
      imageMediaId:
        "44444444-4444-4444-4444-444444444444",
      interestIds: [],
    });

    expect(requestBody).toHaveProperty(
      "imageMediaId",
      "44444444-4444-4444-4444-444444444444",
    );

    expect(requestBody)
      .not.toHaveProperty("imageUrl");
  });

  it("preserves the Spring Page returned by the looped-events endpoint", async () => {
    server.use(
      http.get(
        "/api/v1/me/looped-events",
        () =>
          HttpResponse.json({
            content: [],
            number: 0,
            size: 20,
            totalElements: 47,
            totalPages: 3,
            first: true,
            last: false,
          }),
      ),
    );

    const result =
      await getMyLoopedEvents();

    expect(result.totalElements)
      .toBe(47);
    expect(result.totalPages).toBe(3);
    expect(result.last).toBe(false);
  });
});
