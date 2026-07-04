export interface EventGroup {
  id: string;
  eventId: string;
  adminId: string;
  maxMembers: number;
  status: string;
  groupNote: string | null;
}