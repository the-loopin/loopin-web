import {
  createGroup,
  getGroup,
  getMyGroups,
  type CreateGroupRequest,
  type GroupItem,
} from "../lib/api";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/**
 * The backend currently exposes the current user's groups through /me/groups.
 * Event pages filter that server-backed list by eventId.
 */

export function useGroup(groupId: string | undefined) {
  return useQuery({
    queryKey: ["groups", groupId],
    queryFn: () => getGroup(groupId ?? ""),
    enabled: Boolean(groupId),
  });
}

export function useMyGroups() {
  return useQuery({
    queryKey: ["groups", "me"],
    queryFn: getMyGroups,
    staleTime: 60_000,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (group: CreateGroupRequest) => createGroup(group),
    onSuccess: (data) => {
      queryClient.setQueryData<GroupItem[]>(
        ["groups", "me"],
        (current = []) => [
          data,
          ...current.filter((group) => group.id !== data.id),
        ],
      );
      queryClient.setQueryData(
        ["groups", data.id],
        data,
      );

      void queryClient.invalidateQueries({
        queryKey: ["groups", "me"],
      });
    },
  });
}
