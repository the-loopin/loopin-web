export interface GroupJoinRequest {
  id: string;
  groupId: string;
  userId: string;
  message: string | null;
  status: string;
  createdAt: string;
}