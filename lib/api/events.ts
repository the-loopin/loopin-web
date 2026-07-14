import apiClient from "./client";
import type {
  EventResponse,
  EventCreateRequest,
  EventUpdateRequest,
  LoopedEventResponse,
  EventType,
  EventCategory,
  EventItem,
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

export function toEventItem(event: EventResponse): EventItem {
  if (!event.id) {
    throw new Error("The events API returned an event without an id.");
  }

  return {
    ...event,
    id: event.id,
    title: event.title ?? "Untitled event",
    description: event.description ?? "",
    type: event.type ?? "EVENT",
    category: event.category ?? "OTHER",
    city: event.city ?? "",
    address: event.address ?? "",
    startDateTime: event.startDateTime ?? "",
    endDateTime: event.endDateTime ?? "",
    isFree: event.isFree ?? true,
    price: event.price ?? 0,
    organizerName: event.organizerName ?? "",
    status: event.status ?? "DRAFT",
    interests: event.interests ?? [],
  };
}

export async function getEvents(params?: GetEventsParams): Promise<SpringPage<EventItem>> {
  const response = await apiClient.get<SpringPage<EventResponse>>("/events", { params });
  return { ...response.data, content: (response.data.content ?? []).map(toEventItem) };
}

export async function getEvent(id: string): Promise<EventItem> {
  const response = await apiClient.get<EventResponse>(`/events/${id}`);
  return toEventItem(response.data);
}

export async function createEvent(payload: EventCreateRequest): Promise<EventItem> {
  const response = await apiClient.post<EventResponse>("/events", payload);
  return toEventItem(response.data);
}

export async function updateEvent(id: string, payload: EventUpdateRequest): Promise<EventItem> {
  const response = await apiClient.put<EventResponse>(`/events/${id}`, payload);
  return toEventItem(response.data);
}

export async function deleteEvent(id: string): Promise<void> {
  await apiClient.delete(`/events/${id}`);
}

export async function loopInEvent(eventId: string): Promise<LoopedEventResponse> {
  const response = await apiClient.post<LoopedEventResponse>(`/events/${eventId}/loop-in`);
  return response.data;
}

export async function unloopEvent(eventId: string): Promise<void> {
  await apiClient.delete(`/events/${eventId}/loop-in`);
}

export async function getMyLoopedEvents(params?: { page?: number; size?: number }): Promise<SpringPage<LoopedEventResponse>> {
  const response = await apiClient.get<SpringPage<LoopedEventResponse>>("/me/looped-events", { params });
  return response.data;
}
