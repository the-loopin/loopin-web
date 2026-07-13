import apiClient from "./client";

export type EventPayload = {
  title: string;
  description: string;
  type: string;
  category: string;
  city: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  startDateTime: string;
  endDateTime: string;
  isFree: boolean;
  price: number;
  organizerName: string;
  imageUrl: string;
  status: string;
};

export type EventItem = EventPayload & {
  id: string | number;
  displayCategory?: string;
  loopedCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

type PageResponse<T> = {
  content?: T[];
};

export type GroupPayload = {
  eventId: string;
  title: string;
  groupSize: string;
  maxMembers: number;
  groupNote: string;
};

export type GroupItem = GroupPayload & {
  id: string;
  adminId: string;
  adminUsername: string;
  status: string;
  memberCount: number;
  createdAt?: string;
};

export type UserItem = {
  id: number;
  email: string;
  name?: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type JoinRequestItem = {
  id: string;
  groupId: string;
  userId: string;
  status: string;
  message: string | null;
  createdAt?: string;
};

export type ProfilePayload = {
  name: string;
  city: string;
  bio: string;
};

export type GroupMemberItem = {
  id: string;
  groupId: string;
  userId: string;
  joinedAt: string;
};

export type UserSettings = {
  emailNotifications: boolean;
  publicProfile: boolean;
};

export type InterestItem = {
  id: string;
  label: string;
};

export async function registerUser(payload: { email: string; name: string }) {
  const response = await apiClient.post<UserItem>("/users/register", payload);
  return response.data;
}

export async function googleLogin(idToken: string) {
  const response = await apiClient.post<{
    token: string;
    email: string;
    name: string;
    role: string;
  }>("/auth/google", { idToken });
  return response.data;
}

export async function devLogin(payload: { email: string; name: string; role: string }) {
  const response = await apiClient.post<{
    token: string;
    email: string;
    name: string;
    role: string;
  }>("/auth/dev-login", payload);
  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get<UserItem>("/users/me");
  return response.data;
}

export async function getEvents(params?: Record<string, string>) {
  const response = await apiClient.get<EventItem[] | PageResponse<EventItem>>("/events", { params });
  return Array.isArray(response.data) ? response.data : response.data.content ?? [];
}

export async function getEvent(id: string) {
  const response = await apiClient.get<EventItem>(`/events/${id}`);
  return response.data;
}

export async function createEvent(payload: EventPayload) {
  const response = await apiClient.post<EventItem>("/events", payload);
  return response.data;
}

export async function updateEvent(id: string, payload: EventPayload) {
  const response = await apiClient.put<EventItem>(`/events/${id}`, payload);
  return response.data;
}

export async function deleteEvent(id: string) {
  await apiClient.delete(`/events/${id}`);
}

export async function createGroup(payload: GroupPayload) {
  const response = await apiClient.post<GroupItem>("/groups", payload);
  return response.data;
}

export async function getGroupsByEvent(eventId: string) {
  const response = await apiClient.get<GroupItem[]>(`/groups/by-event/${eventId}`);
  return response.data;
}

// Groups the current user belongs to (as admin or member) - powers the
// "My Active Groups" panel on the profile page.
export async function getMyGroups() {
  const response = await apiClient.get<GroupItem[] | PageResponse<GroupItem>>("/me/groups");
  return Array.isArray(response.data) ? response.data : response.data.content ?? [];
}

export async function getGroup(id: string) {
  const response = await apiClient.get<GroupItem>(`/groups/${id}`);
  return response.data;
}

export async function updateGroup(id: string, payload: GroupPayload) {
  const response = await apiClient.put<GroupItem>(`/groups/${id}`, payload);
  return response.data;
}

export async function updateGroupStatus(id: string, status: string) {
  const response = await apiClient.patch<GroupItem>(`/groups/${id}/status`, { status });
  return response.data;
}

export async function getGroupMembers(
  groupId: string,
): Promise<GroupMemberItem[]> {
  const response = await apiClient.get<GroupMemberItem[]>(
    `/groups/${groupId}/members`,
  );

  return response.data;
}

export async function addGroupMember(
  groupId: string,
  userPublicId: string,
) {
  const response = await apiClient.post(
    `/groups/${groupId}/members`,
    {
      userId: userPublicId,
    },
  );

  return response.data;
}

export async function removeGroupMember(groupId: string, userId: string) {
  await apiClient.delete(`/groups/${groupId}/members/${userId}`);
}

export async function createJoinRequest(groupId: string, message: string) {
  const response = await apiClient.post<JoinRequestItem>(`/groups/${groupId}/join-requests`, { message });
  return response.data;
}

export async function getGroupJoinRequests(groupId: string) {
  const response = await apiClient.get<JoinRequestItem[]>(`/groups/${groupId}/join-requests`);
  return response.data;
}

export async function getMyJoinRequests() {
  const response = await apiClient.get<JoinRequestItem[]>("/me/group-join-requests");
  return response.data;
}

export async function approveJoinRequest(groupId: string, requestId: string) {
  const response = await apiClient.patch<JoinRequestItem>(
    `/groups/${groupId}/join-requests/${requestId}/approve`,
  );
  return response.data;
}

export async function rejectJoinRequest(groupId: string, requestId: string) {
  const response = await apiClient.patch<JoinRequestItem>(
    `/groups/${groupId}/join-requests/${requestId}/reject`,
  );
  return response.data;
}

export async function getProfile() {
  const response = await apiClient.get<ProfilePayload>("/me");
  return response.data;
}

export async function updateProfile(payload: ProfilePayload) {
  const response = await apiClient.put<ProfilePayload>("/me", payload);
  return response.data;
}

export async function getBadges() {
  const response = await apiClient.get<string[]>("/me/badges");
  return response.data;
}

// Notification / privacy preferences shown on the profile page.
export async function getSettings() {
  const response = await apiClient.get<UserSettings>("/me/settings");
  return response.data;
}

export async function updateSettings(payload: Partial<UserSettings>) {
  const response = await apiClient.patch<UserSettings>("/me/settings", payload);
  return response.data;
}

// Full catalog of interests users can pick from (used to render the
// "Interests" panel with the correct labels, even ones the user hasn't
// selected yet).
export async function getAvailableInterests() {
  const response = await apiClient.get<InterestItem[]>("/interests");
  return response.data;
}

// The IDs of interests the current user has selected.
export async function getMyInterests() {
  const response = await apiClient.get<string[]>("/me/interests");
  return response.data;
}

export async function updateMyInterests(interestIds: string[]) {
  const response = await apiClient.put<string[]>("/me/interests", { interestIds });
  return response.data;
}

export async function getAdminStats() {
  const response = await apiClient.get<Record<string, number>>("/admin/dashboard/stats");
  return response.data;
}

export async function getAdminUsers() {
  const response = await apiClient.get<{ content?: UserItem[] } | UserItem[]>("/admin/users");
  return Array.isArray(response.data) ? response.data : response.data.content ?? [];
}

export async function getAdminEvents() {
  const response = await apiClient.get<{ content?: EventItem[] } | EventItem[]>("/admin/events");
  return Array.isArray(response.data) ? response.data : response.data.content ?? [];
}

export async function updateAdminUserRole(userId: string, role: string) {
  const response = await apiClient.put<UserItem>(`/admin/users/${userId}/role`, { role });
  return response.data;
}

export async function deleteAdminUser(userId: string) {
  await apiClient.delete(`/admin/users/${userId}`);
}

export async function deleteAdminEvent(eventId: string) {
  await apiClient.delete(`/admin/events/${eventId}`);
}

export async function loopInEvent(eventId: string) {
  const response = await apiClient.post<EventItem>(`/events/${eventId}/loop-in`);
  return response.data;
}

export async function unloopEvent(eventId: string) {
  await apiClient.delete(`/events/${eventId}/loop-in`);
}

export async function getMyLoopedEvents() {
  const response = await apiClient.get<EventItem[]>("/me/looped-events");
  return response.data;
}

export type MediaUploadRequest = {
  purpose: "EVENT_IMAGE" | "PROFILE_AVATAR" | "GROUP_IMAGE";
  fileName: string;
  contentType: string;
  sizeBytes: number;
};

export type MediaUploadResponse = {
  mediaId: string;
  uploadUrl: string;
  expiresAt: string;
  requiredHeaders?: Record<string, string>;
};

export async function requestMediaUpload(payload: MediaUploadRequest) {
  const response = await apiClient.post<MediaUploadResponse>("/media/uploads", payload);
  return response.data;
}

export async function completeMediaUpload(mediaId: string) {
  const response = await apiClient.post<{ mediaId: string; status: string }>(`/media/uploads/${mediaId}/complete`);
  return response.data;
}