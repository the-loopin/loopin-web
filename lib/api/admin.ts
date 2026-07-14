import apiClient from "./client";
import type {
  DashboardStatsResponse,
  UserResponse,
  EventResponse,
  EventStatus,
} from "./contracts";
import type { SpringPage } from "./pagination";

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

export async function getAdminEvents(status?: EventStatus, page = 0, size = 10): Promise<SpringPage<EventResponse>> {
  const response = await apiClient.get<SpringPage<EventResponse>>("/admin/events", {
    params: { status, page, size },
  });
  return response.data;
}

export async function updateUserRole(userId: string, role: "USER" | "ADMIN"): Promise<UserResponse> {
  const response = await apiClient.put<UserResponse>(`/admin/users/${userId}/role`, { role });
  return response.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/admin/users/${userId}`);
}

export async function deleteAdminEvent(eventId: string): Promise<void> {
  await apiClient.delete(`/admin/events/${eventId}`);
}

// Keep old camelCase/getDashboardStats alias or stubs for compatibility
export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  return getAdminStats();
}

export async function cancelEvent(eventId: string): Promise<void> {
  await apiClient.post(`/events/${eventId}/cancel`);
}
