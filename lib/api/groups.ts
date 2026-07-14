import apiClient from "./client";
import type {
  GroupResponse,
  CreateGroupRequest,
  UpdateGroupRequest,
  UpdateGroupStatusRequest,
  GroupMemberResponse,
  GroupMemberRequest,
  GroupJoinRequestResponse,
} from "./contracts";

export async function createGroup(payload: CreateGroupRequest): Promise<GroupResponse> {
  const response = await apiClient.post<GroupResponse>("/groups", payload);
  return response.data;
}

export async function getGroup(groupId: string): Promise<GroupResponse> {
  const response = await apiClient.get<GroupResponse>(`/groups/${groupId}`);
  return response.data;
}

export async function updateGroup(groupId: string, payload: UpdateGroupRequest): Promise<GroupResponse> {
  const response = await apiClient.put<GroupResponse>(`/groups/${groupId}`, payload);
  return response.data;
}

export async function updateGroupStatus(
  groupId: string,
  payload: UpdateGroupStatusRequest
): Promise<GroupResponse> {
  const response = await apiClient.patch<GroupResponse>(`/groups/${groupId}/status`, payload);
  return response.data;
}

// Group Members
export async function getGroupMembers(groupId: string): Promise<GroupMemberResponse[]> {
  const response = await apiClient.get<GroupMemberResponse[]>(`/groups/${groupId}/members`);
  return response.data;
}

export async function addGroupMember(groupId: string, userId: string): Promise<GroupMemberResponse> {
  const payload: GroupMemberRequest = { userId };
  const response = await apiClient.post<GroupMemberResponse>(`/groups/${groupId}/members`, payload);
  return response.data;
}

export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
  await apiClient.delete(`/groups/${groupId}/members/${userId}`);
}

// Join Requests
export async function createJoinRequest(groupId: string, message: string): Promise<GroupJoinRequestResponse> {
  const response = await apiClient.post<GroupJoinRequestResponse>(`/groups/${groupId}/join-requests`, {
    message,
  });
  return response.data;
}

export async function getGroupJoinRequests(groupId: string): Promise<GroupJoinRequestResponse[]> {
  const response = await apiClient.get<GroupJoinRequestResponse[]>(`/groups/${groupId}/join-requests`);
  return response.data;
}

export async function getMyJoinRequests(): Promise<GroupJoinRequestResponse[]> {
  const response = await apiClient.get<GroupJoinRequestResponse[]>("/me/group-join-requests");
  return response.data;
}

export async function approveJoinRequest(groupId: string, requestId: string): Promise<GroupJoinRequestResponse> {
  const response = await apiClient.patch<GroupJoinRequestResponse>(
    `/groups/${groupId}/join-requests/${requestId}/approve`
  );
  return response.data;
}

export async function rejectJoinRequest(groupId: string, requestId: string): Promise<GroupJoinRequestResponse> {
  const response = await apiClient.patch<GroupJoinRequestResponse>(
    `/groups/${groupId}/join-requests/${requestId}/reject`
  );
  return response.data;
}

// Gaps: Backend lacks endpoints for listing groups by event or listing my groups.
// But we must perform the HTTP requests as per instructions (calling them will result in 404 until backend adds them).
export async function getGroupsByEvent(eventId: string): Promise<GroupResponse[]> {
  const response = await apiClient.get<GroupResponse[]>(`/groups/by-event/${eventId}`);
  return response.data;
}

export async function getMyGroups(): Promise<GroupResponse[]> {
  const response = await apiClient.get<GroupResponse[]>("/me/groups");
  return response.data;
}

// Keep old camelCase/getGroupById alias just in case
export async function getGroupById(groupId: string): Promise<GroupResponse> {
  return getGroup(groupId);
}