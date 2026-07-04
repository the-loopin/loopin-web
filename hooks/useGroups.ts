import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createGroup, getGroupById, getGroupsByEvent } from "../lib/api/groups";
import type { EventGroup } from "../lib/types/group";

export function useGroupsByEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ["groups", eventId],
    queryFn: () => getGroupsByEvent(eventId ?? ""),
    enabled: Boolean(eventId),
  });
}

export function useGroup(groupId: string | undefined) {
  return useQuery({
    queryKey: ["groups", groupId],
    queryFn: () => getGroupById(groupId ?? ""),
    enabled: Boolean(groupId),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (group: EventGroup) => createGroup(group),
    onSuccess: (_, group) => {
      void queryClient.invalidateQueries({ queryKey: ["groups", group.eventId] });
    },
  });
}