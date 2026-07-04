import type { GroupMessage } from "../types/message";

export async function getGroupMessages(groupId: string): Promise<GroupMessage[]> {
  void groupId;
  return [];
}

export async function sendMessage(message: GroupMessage): Promise<GroupMessage> {
  return message;
}