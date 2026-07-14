import apiClient from "./client";
import type { CreateGroupMessageRequest, GroupMessageResponse } from "./contracts";
import type { SpringPage } from "./pagination";

export async function getGroupMessages(
  groupId: string,
  page = 0,
  size = 200
): Promise<SpringPage<GroupMessageResponse>> {
  const response = await apiClient.get<SpringPage<GroupMessageResponse>>(`/groups/${groupId}/messages`, {
    params: { page, size },
  });
  return response.data;
}

export async function sendMessage(
  groupId: string,
  message: CreateGroupMessageRequest
): Promise<GroupMessageResponse> {
  const response = await apiClient.post<GroupMessageResponse>(`/groups/${groupId}/messages`, message);
  return response.data;
}
