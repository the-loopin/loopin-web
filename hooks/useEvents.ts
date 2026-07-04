import { useMutation, useQuery } from "@tanstack/react-query";
import { getEventById, getEvents } from "../lib/api/events";

export function useEvents() {
  return useQuery({ queryKey: ["events"], queryFn: getEvents });
}

export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ["events", eventId],
    queryFn: () => getEventById(eventId ?? ""),
    enabled: Boolean(eventId),
  });
}

export function useRefreshEvents() {
  return useMutation({ mutationFn: async () => getEvents() });
}