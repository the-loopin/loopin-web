export type BadgeCategory = "Activity" | "Community" | "Creator" | "Social" | "Events" | "Special";
export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export interface BadgeUI {
  id: string; // The backend identifier
  title: string;
  description: string;
  category: BadgeCategory;
  icon: string; // Emoji or icon name
  rarity: BadgeRarity;
  // State like 'status', 'progress', 'earnedAt', 'xp' is removed to adhere to architectural principles.
}

export const BADGE_UI_CATALOG: BadgeUI[] = [
  {
    id: "welcome",
    title: "Welcome to Loopin",
    description: "Joined the Loopin community",
    category: "Community",
    icon: "hand",
    rarity: "common",
  },
  {
    id: "first-post",
    title: "First Post",
    description: "Created your first post in the community",
    category: "Creator",
    icon: "medal",
    rarity: "common",
  },
  {
    id: "first-like",
    title: "First Like",
    description: "Liked a post for the first time",
    category: "Social",
    icon: "heart",
    rarity: "common",
  },
  {
    id: "first-comment",
    title: "First Comment",
    description: "Started a conversation by commenting",
    category: "Social",
    icon: "message",
    rarity: "common",
  },
  {
    id: "community-member",
    title: "Community Member",
    description: "Joined your first group",
    category: "Community",
    icon: "users",
    rarity: "rare",
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Attended events in 3 different cities/areas",
    category: "Activity",
    icon: "map",
    rarity: "rare",
  },
  {
    id: "30-day-streak",
    title: "30 Day Streak",
    description: "Logged in for 30 consecutive days",
    category: "Activity",
    icon: "flame",
    rarity: "epic",
  },
  {
    id: "top-creator",
    title: "Top Creator",
    description: "Reach 500 Likes on your posts",
    category: "Creator",
    icon: "award",
    rarity: "epic",
  },
  {
    id: "100-likes",
    title: "100 Likes",
    description: "Received 100 likes across all your posts",
    category: "Creator",
    icon: "star",
    rarity: "rare",
  },
  {
    id: "trending-post",
    title: "Trending",
    description: "Have a post reach the trending section",
    category: "Social",
    icon: "trending",
    rarity: "epic",
  },
  {
    id: "event-participant",
    title: "Event Participant",
    description: "Attended 5 community events",
    category: "Events",
    icon: "ticket",
    rarity: "common",
  },
  {
    id: "holiday-badge",
    title: "Holiday Spirit",
    description: "Participated in a special holiday event",
    category: "Special",
    icon: "gift",
    rarity: "legendary",
  },
  {
    id: "secret-badge",
    title: "???",
    description: "Unlock this by exploring hidden features",
    category: "Special",
    icon: "secret",
    rarity: "legendary",
  },
  {
    id: "ATTENDEE",
    title: "Attendee",
    description: "Successfully joined and participated in your first community event.",
    category: "Events",
    icon: "check",
    rarity: "common",
  },
  {
    id: "CREATOR",
    title: "Event Creator",
    description: "Created a group or organized a community walk/event under your name.",
    category: "Creator",
    icon: "sparkles",
    rarity: "rare",
  },
  {
    id: "HELPER",
    title: "Helper",
    description: "Recognized by other members for guiding and supporting the community.",
    category: "Community",
    icon: "flag",
    rarity: "epic",
  }
];

// Fallback for unknown backend badges
export const UNKNOWN_BADGE_UI: BadgeUI = {
  id: "unknown",
  title: "Mystery Badge",
  description: "An achievement that hasn't been properly mapped in the catalog.",
  category: "Special",
  icon: "help",
  rarity: "common",
};

export function getBadgeUI(id: string): BadgeUI {
  const found = BADGE_UI_CATALOG.find((b) => b.id === id);
  if (found) {
    return found;
  }
  console.warn(`Badge ID "${id}" returned from backend is missing from BADGE_UI_CATALOG.`);
  return { ...UNKNOWN_BADGE_UI, id };
}
