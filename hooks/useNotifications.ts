import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getNotifications,
  markNotificationAsRead,
} from "@/lib/api";

export function useUnreadNotifications(
  enabled: boolean,
) {
  return useQuery({
    queryKey: [
      "notifications",
      "UNREAD",
    ],
    queryFn: () =>
      getNotifications(
        "UNREAD",
        0,
        10,
      ),
    enabled,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
}