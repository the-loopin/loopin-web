import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroup, getGroup, CreateGroupRequest } from "../lib/api";
import { useQuery } from "@tanstack/react-query";

/**
 * useGroupsByEvent is NOT available — the backend does not expose a group listing
 * endpoint for a given event. Do not add a fake queryFn here.
 *
 * To show a group list in the UI, display an explicit "unavailable" state.
 */

export function useGroup(groupId: string | undefined) {
  return useQuery({
    queryKey: ["groups", groupId],
    queryFn: () => getGroup(groupId ?? ""),
    enabled: Boolean(groupId),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (group: CreateGroupRequest) => createGroup(group),
    onSuccess: (data) => {
      // Invalidate the individual group cache so that navigating to the group
      // detail page shows fresh data.
      void queryClient.invalidateQueries({ queryKey: ["groups", data.id] });
    },
  });
}
