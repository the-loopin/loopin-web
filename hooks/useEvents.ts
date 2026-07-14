import { useMutation, useQuery } from "@tanstack/react-query";
import { getEvent, getEvents } from "../lib/api";

export function useEvents() {
  return useQuery({ queryKey: ["events"], queryFn: () => getEvents() });
}

export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ["events", eventId],
    queryFn: () => getEvent(eventId ?? ""),
    enabled: Boolean(eventId),
  });
}

export function useRefreshEvents() {
  return useMutation({ mutationFn: async () => getEvents() });
}

import { getMyLoopedEvents } from "../lib/api";

export function useMyLoopedEvents() {
  return useQuery({
    queryKey: ["myLoopedEvents"],
    queryFn: () => getMyLoopedEvents(),
  });
}
