import type { components } from "./generated/schema";

// Helper alias for components["schemas"]
export type SchemaOf<T extends keyof components["schemas"]> = components["schemas"][T];

// Stable Boundary Types

// Auth
export type AuthResponse = SchemaOf<"AuthResponse">;
export type GoogleLoginRequest = SchemaOf<"GoogleLoginRequest">;
export type DevLoginRequest = SchemaOf<"DevLoginRequest">;

// User / Profile
export type UserResponse = SchemaOf<"UserResponse">;
export type UserRegisterRequest = SchemaOf<"UserRegisterRequest">;
export type UpdateUserRoleRequest = SchemaOf<"UpdateUserRoleRequest">;

export type InterestResponse = SchemaOf<"InterestResponse">;

export type MediaReferenceResponse = {
  id: string;
  contentType: string;
  sizeBytes: number;
  url?: string | null;
};

export type UserProfileResponse = Omit<SchemaOf<"UserProfileResponse">, "interests"> & {
  avatar?: MediaReferenceResponse | null;
  interests?: InterestResponse[];
  onlineStatus?: string | null;
};

export type UpdateUserProfileRequest = SchemaOf<"UpdateUserProfileRequest">;
export type UpdateUserAvatarRequest = {
  mediaId: string;
};

// Events
export type EventResponse = {
  id: string;
  title: string;
  description: string;
  type: EventType;
  category: EventCategory;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  startDateTime: string;
  endDateTime: string;
  isFree: boolean;
  price?: number;
  organizerName: string;
  imageUrl?: string | null;
  status: EventStatus;
  moderationStatus?: ModerationStatus;
  moderationRejectionReason?: string;
  interests?: InterestResponse[];
  createdAt?: string;
  updatedAt?: string;
  loopedCount?: number;
  displayCategory?: string;
};
export type EventCreateRequest = SchemaOf<"EventCreateRequest"> & {
  imageMediaId?: string | null;
};
export type EventUpdateRequest = SchemaOf<"EventUpdateRequest"> & {
  imageMediaId?: string | null;
};
export type LoopedEventResponse = {
  event?: EventResponse;
  loopedCount?: number;
};

// Groups
export type GroupResponse = {
  id: string;
  eventId: string;
  adminId: string;
  adminUsername: string;
  title: string;
  groupSize: GroupSize;
  maxMembers: number;
  status: GroupStatus;
  groupNote: string | null;
  memberCount: number;
  createdAt: string;
};
export type CreateGroupRequest = SchemaOf<"CreateGroupRequest">;
export type UpdateGroupRequest = SchemaOf<"UpdateGroupRequest">;
export type UpdateGroupStatusRequest = SchemaOf<"UpdateGroupStatusRequest">;

// Group Members
export type GroupMemberResponse = SchemaOf<"GroupMemberResponse">;
export type GroupMemberRequest = SchemaOf<"GroupMemberRequest">;

// Group Join Requests
export type GroupJoinRequestResponse = {
  id: string;
  groupId: string;
  userId: string;
  status: GroupJoinRequestStatus;
  message?: string;
  createdAt: string;
};
export type CreateGroupJoinRequestRequest = SchemaOf<"CreateGroupJoinRequestRequest">;

// Messages
export type GroupMessageResponse = {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  createdAt: string;
};
export type CreateGroupMessageRequest = SchemaOf<"CreateGroupMessageRequest">;

// Media
export type RequestMediaUploadRequest = SchemaOf<"RequestMediaUploadRequest">;
export type MediaUploadResponse = SchemaOf<"MediaUploadResponse">;
export type MediaCompletionResponse = SchemaOf<"MediaCompletionResponse">;

// Notifications & Announcements
export type NotificationResponse = SchemaOf<"NotificationResponse">;
export type CreateAnnouncementRequest = SchemaOf<"CreateAnnouncementRequest">;
export type AnnouncementResponse = SchemaOf<"AnnouncementResponse">;

// Reports
export type CreateReportRequest = SchemaOf<"CreateReportRequest">;
export type ReportResponse = SchemaOf<"ReportResponse">;
export type UpdateReportStatusRequest = SchemaOf<"UpdateReportStatusRequest">;

// Admin / Moderation
export type DashboardStatsResponse = SchemaOf<"DashboardStatsResponse">;
export type ModerationItemResponse = SchemaOf<"ModerationItemResponse">;
export type RejectModerationRequest = SchemaOf<"RejectModerationRequest">;
export type UpdateUserRoleRequestLocal = SchemaOf<"UpdateUserRoleRequest">;

// Enums (mapped from union types)
export type EventType = "EVENT" | "ACTIVITY";
export type EventCategory =
  | "TECH"
  | "STARTUP"
  | "HR"
  | "EDUCATION"
  | "TRAVEL"
  | "SPORT"
  | "SOCIAL"
  | "LANGUAGE"
  | "CREATIVE"
  | "OTHER";
export type EventStatus = "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";
export type ModerationStatus = "APPROVED" | "PENDING_REVIEW" | "REJECTED";
export type GroupSize = "TWO" | "THREE" | "FOUR" | "FOUR_PLUS";
export type GroupStatus = "OPEN" | "FULL" | "ARCHIVED" | "CANCELLED";
export type GroupJoinRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";
export type NotificationType =
  | "EVENT_UPDATE"
  | "GROUP_INVITATION"
  | "GROUP_ACTIVITY"
  | "MODERATION_UPDATE"
  | "EVENT_REMINDER"
  | "SYSTEM_ANNOUNCEMENT"
  | "EVENT_LOOP_IN";
export type NotificationStatus = "UNREAD" | "READ" | "ARCHIVED";
export type NotificationReferenceType = "EVENT" | "GROUP" | "REPORT" | "SYSTEM";
export type ReportTargetType = "GROUP" | "MESSAGE";
export type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";

// Compatibility aliases
export type EventItem = EventResponse;
export type UserItem = UserResponse;
export type GroupItem = GroupResponse;
export type JoinRequestItem = GroupJoinRequestResponse;
export type ProfilePayload = UserProfileResponse;
export type EventPayload = Omit<EventResponse, "id" | "createdAt" | "updatedAt" | "loopedCount" | "displayCategory" | "interests">;
export type GroupPayload = CreateGroupRequest;
export type GroupMemberItem = GroupMemberResponse;
export type MediaPurpose = "EVENT_IMAGE" | "GROUP_IMAGE" | "PROFILE_AVATAR";


