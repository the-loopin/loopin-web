import { useQuery } from "@tanstack/react-query";

import {
  getCurrentUser,
  getProfile,
} from "../lib/api";

async function loadUserProfile() {
  const [user, profile] = await Promise.all([
    getCurrentUser(),
    getProfile(),
  ]);

  return {
    user,
    profile,
  };
}

export type UserProfileQueryData =
  Awaited<ReturnType<typeof loadUserProfile>>;

export function useProfile() {
  return useQuery({
    queryKey: ["userProfile"] as const,
    queryFn: loadUserProfile,
    staleTime: 5 * 60 * 1000,
  });
}