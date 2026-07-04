import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGroupMessages, sendMessage } from "../lib/api/messages";
import type { GroupMessage } from "../lib/types/message";

export function useMessages(groupId: string | undefined) {
  return useQuery({
    queryKey: ["messages", groupId],
    queryFn: () => getGroupMessages(groupId ?? ""),
    enabled: Boolean(groupId),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: GroupMessage) => sendMessage(message),
    onSuccess: (_, message) => {
      void queryClient.invalidateQueries({ queryKey: ["messages", message.groupId] });
    },
  });
}