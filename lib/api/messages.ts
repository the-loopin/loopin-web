import apiClient from "./client";
import type { CreateGroupMessageRequest, GroupMessageResponse } from "./contracts";
import type { SpringPage } from "./pagination";
import type { GroupMessage } from "../types/message";
import { encodeApiIdentifier, normalizeApiIdentifier } from "./path";
import { toDisplayName } from "../user/displayName";

function requireMessageIdentifier(
  value: string | undefined,
  label: string,
): string {
  if (!value) {
    throw new Error(`The messages API returned a message without ${label}.`);
  }

  return normalizeApiIdentifier(value, label);
}

export function toGroupMessage(message: GroupMessageResponse): GroupMessage {
  return {
    id: requireMessageIdentifier(message.id, "messageId"),
    groupId: requireMessageIdentifier(message.groupId, "groupId"),
    senderId: requireMessageIdentifier(message.senderId, "senderId"),
    senderName: toDisplayName(message.senderName),
    messageText: message.messageText ?? "",
    createdAt: message.createdAt ?? "",
  };
}

export async function getGroupMessages(
  groupId: string,
  page = 0,
  size = 200
): Promise<SpringPage<GroupMessage>> {
  const response = await apiClient.get<SpringPage<GroupMessageResponse>>(`/groups/${encodeApiIdentifier(groupId, "groupId")}/messages`, {
    params: { page, size },
  });
  return { ...response.data, content: (response.data.content ?? []).map(toGroupMessage) };
}

export async function sendMessage(
  groupId: string,
  message: CreateGroupMessageRequest
): Promise<GroupMessage> {
  const response = await apiClient.post<GroupMessageResponse>(`/groups/${encodeApiIdentifier(groupId, "groupId")}/messages`, message);
  return toGroupMessage(response.data);
}
