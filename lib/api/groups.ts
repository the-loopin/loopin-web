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
import { encodeApiIdentifier, normalizeApiIdentifier } from "./path";

function requireId(value: string | undefined, label: string): string {
  if (!value) throw new Error(`The groups API returned a record without ${label}.`);
  return normalizeApiIdentifier(value, label);
}

function toGroupItem(group: GroupResponse): GroupItem {
  return {
    ...group,
    id: requireId(group.id, "groupId"), eventId: requireId(group.eventId, "eventId"), adminId: requireId(group.adminId, "adminId"),
    adminUsername: group.adminUsername ?? "", title: group.title ?? "Untitled group",
    groupSize: group.groupSize ?? "FOUR", maxMembers: group.maxMembers ?? 0,
    status: group.status ?? "OPEN", groupNote: group.groupNote ?? "", memberCount: group.memberCount ?? 0,
  };
}
function toGroupMemberItem(member: GroupMemberResponse): GroupMemberItem {
  return { ...member, id: requireId(member.id, "memberId"), groupId: requireId(member.groupId, "groupId"), userId: requireId(member.userId, "userId") };
}
function toJoinRequestItem(request: GroupJoinRequestResponse): JoinRequestItem {
  return { ...request, id: requireId(request.id, "requestId"), groupId: requireId(request.groupId, "groupId"), userId: requireId(request.userId, "userId"), status: request.status ?? "PENDING", message: request.message ?? "" };
}

export async function createGroup(payload: CreateGroupRequest): Promise<GroupItem> {
  const response = await apiClient.post<GroupResponse>("/groups", payload);
  return toGroupItem(response.data);
}

export async function getGroup(groupId: string): Promise<GroupItem> {
  const response = await apiClient.get<GroupResponse>(`/groups/${encodeApiIdentifier(groupId, "groupId")}`);
  return toGroupItem(response.data);
}

export async function getMyGroups(): Promise<GroupItem[]> {
  const response =
    await apiClient.get<GroupResponse[]>(
      "/me/groups",
    );

  return response.data.map(toGroupItem);
}

export async function updateGroup(groupId: string, payload: UpdateGroupRequest): Promise<GroupItem> {
  const response = await apiClient.put<GroupResponse>(`/groups/${encodeApiIdentifier(groupId, "groupId")}`, payload);
  return toGroupItem(response.data);
}

export async function updateGroupStatus(
  groupId: string,
  payload: UpdateGroupStatusRequest
): Promise<GroupItem> {
  const response = await apiClient.patch<GroupResponse>(`/groups/${encodeApiIdentifier(groupId, "groupId")}/status`, payload);
  return toGroupItem(response.data);
}

// Group Members
export async function getGroupMembers(groupId: string): Promise<GroupMemberItem[]> {
  const response = await apiClient.get<GroupMemberResponse[]>(`/groups/${encodeApiIdentifier(groupId, "groupId")}/members`);
  return response.data.map(toGroupMemberItem);
}

export async function addGroupMember(groupId: string, userId: string): Promise<GroupMemberItem> {
  const payload: GroupMemberRequest = {
    userId: normalizeApiIdentifier(userId, "userId"),
  };
  const response = await apiClient.post<GroupMemberResponse>(`/groups/${encodeApiIdentifier(groupId, "groupId")}/members`, payload);
  return toGroupMemberItem(response.data);
}

export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
  await apiClient.delete(`/groups/${encodeApiIdentifier(groupId, "groupId")}/members/${encodeApiIdentifier(userId, "userId")}`);
}

// Join Requests
export async function createJoinRequest(groupId: string, message: string): Promise<JoinRequestItem> {
  const response = await apiClient.post<GroupJoinRequestResponse>(`/groups/${encodeApiIdentifier(groupId, "groupId")}/join-requests`, {
    message,
  });
  return toJoinRequestItem(response.data);
}

export async function getGroupJoinRequests(groupId: string): Promise<JoinRequestItem[]> {
  const response = await apiClient.get<GroupJoinRequestResponse[]>(`/groups/${encodeApiIdentifier(groupId, "groupId")}/join-requests`);
  return response.data.map(toJoinRequestItem);
}

export async function getMyJoinRequests(): Promise<JoinRequestItem[]> {
  const response = await apiClient.get<GroupJoinRequestResponse[]>("/me/group-join-requests");
  return response.data.map(toJoinRequestItem);
}

export async function approveJoinRequest(groupId: string, requestId: string): Promise<JoinRequestItem> {
  const response = await apiClient.patch<GroupJoinRequestResponse>(
    `/groups/${encodeApiIdentifier(groupId, "groupId")}/join-requests/${encodeApiIdentifier(requestId, "requestId")}/approve`
  );
  return toJoinRequestItem(response.data);
}

export async function rejectJoinRequest(groupId: string, requestId: string): Promise<JoinRequestItem> {
  const response = await apiClient.patch<GroupJoinRequestResponse>(
    `/groups/${encodeApiIdentifier(groupId, "groupId")}/join-requests/${encodeApiIdentifier(requestId, "requestId")}/reject`
  );
  return toJoinRequestItem(response.data);
}
