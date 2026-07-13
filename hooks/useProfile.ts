import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, getProfile, UserItem, ProfilePayload } from "../lib/api/loopin";

export function useProfile() {
  return useQuery<{ user: UserItem; profile: ProfilePayload }, Error>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const [user, profile] = await Promise.all([
        getCurrentUser(),
        getProfile(),
      ]);
      return { user, profile };
    },
    staleTime: 5 * 60 * 1000, 
  });
}
