import type { EventGroup } from "../types/group";

export async function getGroupsByEvent(eventId: string): Promise<EventGroup[]> {
  void eventId;
  return [];
}

export async function getGroupById(groupId: string): Promise<EventGroup | null> {
  void groupId;
  return null;
}

export async function createGroup(group: EventGroup): Promise<EventGroup> {
  return group;
}