import { useMutation, useQuery } from "@tanstack/react-query";
import type { GroupJoinRequest } from "../lib/types/joinRequest";

async function getJoinRequests(groupId: string): Promise<GroupJoinRequest[]> {
  void groupId;
  return [];
}

async function acceptJoinRequest(requestId: string): Promise<{ requestId: string }> {
  return { requestId };
}

async function rejectJoinRequest(requestId: string): Promise<{ requestId: string }> {
  return { requestId };
}

export function useJoinRequests(groupId: string | undefined) {
  return useQuery({
    queryKey: ["joinRequests", groupId],
    queryFn: () => getJoinRequests(groupId ?? ""),
    enabled: Boolean(groupId),
  });
}

export function useAcceptJoinRequest() {
  return useMutation({ mutationFn: acceptJoinRequest });
}

export function useRejectJoinRequest() {
  return useMutation({ mutationFn: rejectJoinRequest });
}