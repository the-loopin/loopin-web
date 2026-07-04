import { useMutation, useQuery } from "@tanstack/react-query";
import { getUserProfile, getUsers, updateProfile } from "../lib/api/users";
import type { UserProfile } from "../lib/types/user";

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: getUsers });
}

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["users", userId, "profile"],
    queryFn: () => getUserProfile(userId ?? ""),
    enabled: Boolean(userId),
  });
}

export function useUpdateProfile() {
  return useMutation({ mutationFn: (profile: UserProfile) => updateProfile(profile) });
}