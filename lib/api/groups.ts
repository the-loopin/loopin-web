import apiClient from "./client";
import type {
  GroupResponse,
  CreateGroupRequest,
  UpdateGroupRequest,
  UpdateGroupStatusRequest,
  GroupMemberResponse,
  GroupMemberRequest,
  GroupJoinRequestResponse,
  GroupItem,
  GroupMemberItem,
  JoinRequestItem,
} from "./contracts";

function requireId(value: string | undefined, label: string): string {
  if (!value) throw new Error(`The groups API returned a record without ${label}.`);
  return value;
}

function toGroupItem(group: GroupResponse): GroupItem {
  return {
    ...group,
    id: requireId(group.id, "an id"), eventId: group.eventId ?? "", adminId: group.adminId ?? "",
    adminUsername: group.adminUsername ?? "", title: group.title ?? "Untitled group",
    groupSize: group.groupSize ?? "FOUR", maxMembers: group.maxMembers ?? 0,
    status: group.status ?? "OPEN", groupNote: group.groupNote ?? "", memberCount: group.memberCount ?? 0,
  };
}
function toGroupMemberItem(member: GroupMemberResponse): GroupMemberItem {
  return { ...member, id: requireId(member.id, "an id"), groupId: member.groupId ?? "", userId: member.userId ?? "" };
}
function toJoinRequestItem(request: GroupJoinRequestResponse): JoinRequestItem {
  return { ...request, id: requireId(request.id, "an id"), groupId: request.groupId ?? "", userId: request.userId ?? "", status: request.status ?? "PENDING", message: request.message ?? "" };
}

export async function createGroup(payload: CreateGroupRequest): Promise<GroupItem> {
  const response = await apiClient.post<GroupResponse>("/groups", payload);
  return toGroupItem(response.data);
}

export async function getGroup(groupId: string): Promise<GroupItem> {
  const response = await apiClient.get<GroupResponse>(`/groups/${groupId}`);
  return toGroupItem(response.data);
}

export async function updateGroup(groupId: string, payload: UpdateGroupRequest): Promise<GroupItem> {
  const response = await apiClient.put<GroupResponse>(`/groups/${groupId}`, payload);
  return toGroupItem(response.data);
}

export async function updateGroupStatus(
  groupId: string,
  payload: UpdateGroupStatusRequest
): Promise<GroupItem> {
  const response = await apiClient.patch<GroupResponse>(`/groups/${groupId}/status`, payload);
  return toGroupItem(response.data);
}

// Group Members
export async function getGroupMembers(groupId: string): Promise<GroupMemberItem[]> {
  const response = await apiClient.get<GroupMemberResponse[]>(`/groups/${groupId}/members`);
  return response.data.map(toGroupMemberItem);
}

export async function addGroupMember(groupId: string, userId: string): Promise<GroupMemberItem> {
  const payload: GroupMemberRequest = { userId };
  const response = await apiClient.post<GroupMemberResponse>(`/groups/${groupId}/members`, payload);
  return toGroupMemberItem(response.data);
}

export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
  await apiClient.delete(`/groups/${groupId}/members/${userId}`);
}

// Join Requests
export async function createJoinRequest(groupId: string, message: string): Promise<JoinRequestItem> {
  const response = await apiClient.post<GroupJoinRequestResponse>(`/groups/${groupId}/join-requests`, {
    message,
  });
  return toJoinRequestItem(response.data);
}

export async function getGroupJoinRequests(groupId: string): Promise<JoinRequestItem[]> {
  const response = await apiClient.get<GroupJoinRequestResponse[]>(`/groups/${groupId}/join-requests`);
  return response.data.map(toJoinRequestItem);
}

export async function getMyJoinRequests(): Promise<JoinRequestItem[]> {
  const response = await apiClient.get<GroupJoinRequestResponse[]>("/me/group-join-requests");
  return response.data.map(toJoinRequestItem);
}

export async function approveJoinRequest(groupId: string, requestId: string): Promise<JoinRequestItem> {
  const response = await apiClient.patch<GroupJoinRequestResponse>(
    `/groups/${groupId}/join-requests/${requestId}/approve`
  );
  return toJoinRequestItem(response.data);
}

export async function rejectJoinRequest(groupId: string, requestId: string): Promise<JoinRequestItem> {
  const response = await apiClient.patch<GroupJoinRequestResponse>(
    `/groups/${groupId}/join-requests/${requestId}/reject`
  );
  return toJoinRequestItem(response.data);
}
