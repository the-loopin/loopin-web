import type { Event } from "../types/event";

export async function getEvents(): Promise<Event[]> {
  return [];
}

export async function getEventById(eventId: string): Promise<Event | null> {
  void eventId;
  return null;
}