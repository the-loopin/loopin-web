import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGroupMessages, sendMessage } from "../lib/api";
import type { CreateGroupMessageRequest } from "../lib/types/message";

export function useMessages(groupId: string | undefined) {
  return useQuery({
    queryKey: ["messages", groupId],
    queryFn: async () => {
      const page = await getGroupMessages(groupId ?? "");
      return page.content || [];
    },
    enabled: Boolean(groupId),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      message,
    }: {
      groupId: string;
      message: CreateGroupMessageRequest;
    }) => sendMessage(groupId, message),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["messages", variables.groupId] });
    },
  });
}
