import apiClient from "./client";
import type {
  EventCategory,
  EventCreateRequest,
  EventItem,
  EventResponse,
  EventType,
  EventUpdateRequest,
  LoopedEventResponse,
} from "./contracts";
import type { SpringPage } from "./pagination";

export interface GetEventsParams {
  type?: EventType;
  category?: EventCategory;
  city?: string;
  isFree?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string[];
}

function requireValue<T>(
  value: T | null | undefined,
  label: string,
): T {
  if (value === null || value === undefined) {
    throw new Error(
      `The events API returned an event without ${label}.`,
    );
  }

  return value;
}

export function toEventItem(
  event: EventResponse,
): EventItem {
  return {
    ...event,
    id: requireValue(event.id, "an id"),
    title: requireValue(event.title, "a title"),
    description: requireValue(
      event.description,
      "a description",
    ),
    type: requireValue(event.type, "a type"),
    category: requireValue(
      event.category,
      "a category",
    ),
    city: requireValue(event.city, "a city"),
    address: event.address ?? "",
    startDateTime: requireValue(
      event.startDateTime,
      "a start date",
    ),
    endDateTime: requireValue(
      event.endDateTime,
      "an end date",
    ),
    isFree: requireValue(
      event.isFree,
      "a free/paid value",
    ),
    price: event.price ?? 0,
    organizerName: requireValue(
      event.organizerName,
      "an organizer name",
    ),
    status: requireValue(event.status, "a status"),
    interests: event.interests ?? [],
  };
}

export async function getEvents(
  params?: GetEventsParams,
): Promise<SpringPage<EventItem>> {
  const response =
    await apiClient.get<SpringPage<EventResponse>>(
      "/events",
      { params },
    );

  return {
    ...response.data,
    content: (response.data.content ?? []).map(
      toEventItem,
    ),
  };
}

export async function getEvent(
  id: string,
): Promise<EventItem> {
  const response =
    await apiClient.get<EventResponse>(
      `/events/${id}`,
    );

  return toEventItem(response.data);
}

export async function createEvent(
  payload: EventCreateRequest,
): Promise<EventItem> {
  const response =
    await apiClient.post<EventResponse>(
      "/events",
      payload,
    );

  return toEventItem(response.data);
}

export async function updateEvent(
  id: string,
  payload: EventUpdateRequest,
): Promise<EventItem> {
  const response =
    await apiClient.put<EventResponse>(
      `/events/${id}`,
      payload,
    );

  return toEventItem(response.data);
}

export async function deleteEvent(
  id: string,
): Promise<void> {
  await apiClient.delete(`/events/${id}`);
}

export async function loopInEvent(
  eventId: string,
): Promise<LoopedEventResponse> {
  const response =
    await apiClient.post<LoopedEventResponse>(
      `/events/${eventId}/loop-in`,
    );

  return response.data;
}

export async function unloopEvent(
  eventId: string,
): Promise<void> {
  await apiClient.delete(
    `/events/${eventId}/loop-in`,
  );
}

export async function getMyLoopedEvents(
  params?: {
    page?: number;
    size?: number;
  },
): Promise<SpringPage<LoopedEventResponse>> {
  const response =
    await apiClient.get<
      SpringPage<LoopedEventResponse>
    >("/me/looped-events", { params });

  return response.data;
}
