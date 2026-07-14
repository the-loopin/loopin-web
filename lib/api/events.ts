import apiClient from "./client";
import type {
  EventResponse,
  EventCreateRequest,
  EventUpdateRequest,
  LoopedEventResponse,
  EventType,
  EventCategory,
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

export async function getEvents(params?: GetEventsParams): Promise<SpringPage<EventResponse>> {
  const response = await apiClient.get<SpringPage<EventResponse>>("/events", { params });
  return response.data;
}

export async function getEvent(id: string): Promise<EventResponse> {
  const response = await apiClient.get<EventResponse>(`/events/${id}`);
  return response.data;
}

export async function createEvent(payload: EventCreateRequest): Promise<EventResponse> {
  const response = await apiClient.post<EventResponse>("/events", payload);
  return response.data;
}

export async function updateEvent(id: string, payload: EventUpdateRequest): Promise<EventResponse> {
  const response = await apiClient.put<EventResponse>(`/events/${id}`, payload);
  return response.data;
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

// Keep old alias for compatibility
export async function getEventById(id: string): Promise<EventResponse> {
  return getEvent(id);
}