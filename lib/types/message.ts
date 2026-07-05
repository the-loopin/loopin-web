export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  createdAt: string;
}

export interface CreateGroupMessageRequest {
  messageText: string;
}
