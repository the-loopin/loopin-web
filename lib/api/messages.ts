import apiClient from "./client";
import type { CreateGroupMessageRequest, GroupMessage } from "../types/message";

export async function getGroupMessages(groupId: string): Promise<GroupMessage[]> {
  const response = await apiClient.get<GroupMessage[]>(`/groups/${groupId}/messages`);
  return response.data;
}

export async function sendMessage(
  groupId: string,
  message: CreateGroupMessageRequest,
): Promise<GroupMessage> {
  const response = await apiClient.post<GroupMessage>(`/groups/${groupId}/messages`, message);
  return response.data;
}
