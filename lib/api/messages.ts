import apiClient from "./client";
import type { CreateGroupMessageRequest, GroupMessage } from "../types/message";

type MessagePage = {
  content?: GroupMessage[];
};

export async function getGroupMessages(groupId: string): Promise<GroupMessage[]> {
  const response = await apiClient.get<GroupMessage[] | MessagePage>(`/groups/${groupId}/messages`, {
    params: { page: 0, size: 200 },
  });

  return Array.isArray(response.data) ? response.data : response.data.content ?? [];
}

export async function sendMessage(
  groupId: string,
  message: CreateGroupMessageRequest,
): Promise<GroupMessage> {
  const response = await apiClient.post<GroupMessage>(`/groups/${groupId}/messages`, message);
  return response.data;
}
