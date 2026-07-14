import apiClient from "./client";
import type { NotificationResponse, NotificationStatus } from "./contracts";
import type { SpringPage } from "./pagination";

export async function getNotifications(
  status?: NotificationStatus,
  page = 0,
  size = 20
): Promise<SpringPage<NotificationResponse>> {
  const response = await apiClient.get<SpringPage<NotificationResponse>>("/notifications", {
    params: { status, page, size },
  });
  return response.data;
}

export async function markNotificationAsRead(id: string): Promise<NotificationResponse> {
  const response = await apiClient.patch<NotificationResponse>(`/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.patch("/notifications/read-all");
}

export async function archiveNotification(id: string): Promise<void> {
  await apiClient.delete(`/notifications/${id}`);
}
