import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createGroup, getGroupById, CreateGroupRequest } from "../lib/api";

export function useGroupsByEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ["groups", eventId],
    queryFn: () => Promise.resolve([]),
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
    mutationFn: (group: CreateGroupRequest) => createGroup(group),
    onSuccess: (_, group) => {
      void queryClient.invalidateQueries({ queryKey: ["groups", group.eventId] });
    },
  });
}