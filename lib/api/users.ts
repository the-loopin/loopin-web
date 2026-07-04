import type { User, UserProfile } from "../types/user";

export async function getUsers(): Promise<User[]> {
  return [];
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  void userId;
  return null;
}

export async function updateProfile(profile: UserProfile): Promise<UserProfile> {
  return profile;
}