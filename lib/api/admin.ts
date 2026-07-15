import apiClient from "./client";
import type {
  DashboardStatsResponse,
  UserResponse,
  EventResponse,
  EventItem,
  EventStatus,
} from "./contracts";
import { toEventItem } from "./events";
import type { SpringPage } from "./pagination";
import { encodeApiIdentifier } from "./path";

export async function getAdminStats(): Promise<DashboardStatsResponse> {
  const response = await apiClient.get<DashboardStatsResponse>("/admin/dashboard/stats");
  return response.data;
}

export async function getAdminUsers(page = 0, size = 10): Promise<SpringPage<UserResponse>> {
  const response = await apiClient.get<SpringPage<UserResponse>>("/admin/users", {
    params: { page, size },
  });
  return response.data;
}

export async function getAdminEvents(status?: EventStatus, page = 0, size = 10): Promise<SpringPage<EventItem>> {
  const response = await apiClient.get<SpringPage<EventResponse>>("/admin/events", {
    params: { status, page, size },
  });
  return { ...response.data, content: (response.data.content ?? []).map(toEventItem) };
}

export async function updateUserRole(userId: string, role: "USER" | "ADMIN"): Promise<UserResponse> {
  const response = await apiClient.put<UserResponse>(`/admin/users/${encodeApiIdentifier(userId, "userId")}/role`, { role });
  return response.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/admin/users/${encodeApiIdentifier(userId, "userId")}`);
}

export async function deleteAdminEvent(eventId: string): Promise<void> {
  await apiClient.delete(`/admin/events/${encodeApiIdentifier(eventId, "eventId")}`);
}

export async function cancelEvent(eventId: string): Promise<void> {
  await apiClient.post(`/events/${encodeApiIdentifier(eventId, "eventId")}/cancel`);
}
