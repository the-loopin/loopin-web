export type BadgeCategory = "Activity" | "Community" | "Creator" | "Social" | "Events" | "Special";
export type BadgeStatus = "unlocked" | "locked";
export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export interface Badge {
  id: string;
  title: string;
  description: string;
  category: BadgeCategory;
  xp: number;
  status: BadgeStatus;
  progress?: number; // Current progress if locked
  maxProgress?: number; // Max progress if locked
  earnedAt?: string; // ISO date string if unlocked
  icon: string; // Emoji or icon name
  rarity: BadgeRarity;
}

export const MOCK_BADGES: Badge[] = [
  {
    id: "welcome",
    title: "Welcome to Loopin",
    description: "Joined the Loopin community",
    category: "Community",
    xp: 50,
    status: "unlocked",
    earnedAt: "2026-01-15T10:00:00Z",
    icon: "hand",
    rarity: "common",
  },
  {
    id: "first-post",
    title: "First Post",
    description: "Created your first post in the community",
    category: "Creator",
    xp: 25,
    status: "unlocked",
    earnedAt: "2026-02-10T14:30:00Z",
    icon: "medal",
    rarity: "common",
  },
  {
    id: "first-like",
    title: "First Like",
    description: "Liked a post for the first time",
    category: "Social",
    xp: 10,
    status: "unlocked",
    earnedAt: "2026-02-11T09:15:00Z",
    icon: "heart",
    rarity: "common",
  },
  {
    id: "first-comment",
    title: "First Comment",
    description: "Started a conversation by commenting",
    category: "Social",
    xp: 15,
    status: "unlocked",
    earnedAt: "2026-02-12T16:45:00Z",
    icon: "message",
    rarity: "common",
  },
  {
    id: "community-member",
    title: "Community Member",
    description: "Joined your first group",
    category: "Community",
    xp: 30,
    status: "unlocked",
    earnedAt: "2026-03-05T11:20:00Z",
    icon: "users",
    rarity: "rare",
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Attended events in 3 different cities/areas",
    category: "Activity",
    xp: 100,
    status: "unlocked",
    earnedAt: "2026-05-20T18:00:00Z",
    icon: "map",
    rarity: "rare",
  },
  {
    id: "30-day-streak",
    title: "30 Day Streak",
    description: "Logged in for 30 consecutive days",
    category: "Activity",
    xp: 150,
    status: "locked",
    progress: 12,
    maxProgress: 30,
    icon: "flame",
    rarity: "epic",
  },
  {
    id: "top-creator",
    title: "Top Creator",
    description: "Reach 500 Likes on your posts",
    category: "Creator",
    xp: 500,
    status: "locked",
    progress: 327,
    maxProgress: 500,
    icon: "award",
    rarity: "epic",
  },
  {
    id: "100-likes",
    title: "100 Likes",
    description: "Received 100 likes across all your posts",
    category: "Creator",
    xp: 100,
    status: "unlocked",
    earnedAt: "2026-06-01T12:00:00Z",
    icon: "star",
    rarity: "rare",
  },
  {
    id: "trending-post",
    title: "Trending",
    description: "Have a post reach the trending section",
    category: "Social",
    xp: 250,
    status: "locked",
    progress: 0,
    maxProgress: 1,
    icon: "trending",
    rarity: "epic",
  },
  {
    id: "event-participant",
    title: "Event Participant",
    description: "Attended 5 community events",
    category: "Events",
    xp: 100,
    status: "locked",
    progress: 2,
    maxProgress: 5,
    icon: "ticket",
    rarity: "common",
  },
  {
    id: "holiday-badge",
    title: "Holiday Spirit",
    description: "Participated in a special holiday event",
    category: "Special",
    xp: 200,
    status: "locked",
    progress: 0,
    maxProgress: 1,
    icon: "gift",
    rarity: "legendary",
  },
  {
    id: "secret-badge",
    title: "???",
    description: "Unlock this by exploring hidden features",
    category: "Special",
    xp: 1000,
    status: "locked",
    progress: 0,
    maxProgress: 1,
    icon: "secret",
    rarity: "legendary",
  },
];
