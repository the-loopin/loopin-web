import { useMutation, useQuery } from "@tanstack/react-query";
import { getUserProfile, getUsers, updateProfile, UpdateUserProfileRequest } from "../lib/api";

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
  return useMutation({ mutationFn: (profile: UpdateUserProfileRequest) => updateProfile(profile) });
}