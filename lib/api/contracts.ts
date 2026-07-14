import type { components } from "./generated/schema";

export type SchemaOf<
  T extends keyof components["schemas"],
> = components["schemas"][T];

// Auth
export type AuthResponse = SchemaOf<"AuthResponse">;
export type GoogleLoginRequest = SchemaOf<"GoogleLoginRequest">;
export type DevLoginRequest = SchemaOf<"DevLoginRequest">;

// Users and profiles
export type UserResponse = SchemaOf<"UserResponse">;
export type UserRegisterRequest = SchemaOf<"UserRegisterRequest">;
export type UpdateUserRoleRequest = SchemaOf<"UpdateUserRoleRequest">;
export type InterestResponse = SchemaOf<"InterestResponse">;
export type UserProfileResponse = SchemaOf<"UserProfileResponse">;
export type UpdateUserProfileRequest =
  SchemaOf<"UpdateUserProfileRequest">;
export type UpdateUserAvatarRequest =
  SchemaOf<"UpdateUserAvatarRequest">;

// Events
export type EventResponse = SchemaOf<"EventResponse">;
export type EventCreateRequest = SchemaOf<"EventCreateRequest">;
export type EventUpdateRequest = SchemaOf<"EventUpdateRequest">;
export type LoopedEventResponse =
  SchemaOf<"LoopedEventResponse">;

// Groups
export type GroupResponse = SchemaOf<"GroupResponse">;
export type CreateGroupRequest =
  SchemaOf<"CreateGroupRequest">;
export type UpdateGroupRequest =
  SchemaOf<"UpdateGroupRequest">;
export type UpdateGroupStatusRequest =
  SchemaOf<"UpdateGroupStatusRequest">;
export type GroupMemberResponse =
  SchemaOf<"GroupMemberResponse">;
export type GroupMemberRequest =
  SchemaOf<"GroupMemberRequest">;
export type GroupJoinRequestResponse =
  SchemaOf<"GroupJoinRequestResponse">;
export type CreateGroupJoinRequestRequest =
  SchemaOf<"CreateGroupJoinRequestRequest">;

// Messages
export type GroupMessageResponse =
  SchemaOf<"GroupMessageResponse">;
export type CreateGroupMessageRequest =
  SchemaOf<"CreateGroupMessageRequest">;

// Media
export type RequestMediaUploadRequest =
  SchemaOf<"RequestMediaUploadRequest">;
export type MediaUploadResponse =
  SchemaOf<"MediaUploadResponse">;
export type MediaCompletionResponse =
  SchemaOf<"MediaCompletionResponse">;
export type MediaReferenceResponse =
  SchemaOf<"MediaReferenceResponse">;

// Notifications and announcements
export type NotificationResponse =
  SchemaOf<"NotificationResponse">;
export type CreateAnnouncementRequest =
  SchemaOf<"CreateAnnouncementRequest">;
export type AnnouncementResponse =
  SchemaOf<"AnnouncementResponse">;

// Reports
export type CreateReportRequest =
  SchemaOf<"CreateReportRequest">;
export type ReportResponse = SchemaOf<"ReportResponse">;
export type UpdateReportStatusRequest =
  SchemaOf<"UpdateReportStatusRequest">;

// Admin and moderation
export type DashboardStatsResponse =
  SchemaOf<"DashboardStatsResponse">;
export type ModerationItemResponse =
  SchemaOf<"ModerationItemResponse">;
export type RejectModerationRequest =
  SchemaOf<"RejectModerationRequest">;

// Stable UI unions
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
export type EventStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "COMPLETED"
  | "CANCELLED";
export type ModerationStatus =
  | "APPROVED"
  | "PENDING_REVIEW"
  | "REJECTED";
export type GroupSize =
  | "TWO"
  | "THREE"
  | "FOUR"
  | "FOUR_PLUS";
export type GroupStatus =
  | "OPEN"
  | "FULL"
  | "ARCHIVED"
  | "CANCELLED";
export type GroupJoinRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";
export type NotificationType =
  | "EVENT_UPDATE"
  | "GROUP_INVITATION"
  | "GROUP_ACTIVITY"
  | "MODERATION_UPDATE"
  | "EVENT_REMINDER"
  | "SYSTEM_ANNOUNCEMENT"
  | "EVENT_LOOP_IN";
export type NotificationStatus =
  | "UNREAD"
  | "READ"
  | "ARCHIVED";
export type NotificationReferenceType =
  | "EVENT"
  | "GROUP"
  | "REPORT"
  | "SYSTEM";
export type ReportTargetType = "GROUP" | "MESSAGE";
export type ReportStatus =
  | "PENDING"
  | "REVIEWED"
  | "RESOLVED"
  | "DISMISSED";
export type MediaPurpose =
  | "EVENT_IMAGE"
  | "GROUP_IMAGE"
  | "PROFILE_AVATAR";

/**
 * Form state only. This is deliberately not derived from EventResponse.
 * Mutation calls must explicitly construct EventCreateRequest or
 * EventUpdateRequest objects.
 */
export interface EventPayload {
  title: string;
  description: string;
  type: EventType;
  category: EventCategory;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  startDateTime: string;
  endDateTime: string;
  isFree: boolean;
  price: number;
  organizerName: string;
}

/**
 * Normalized event consumed by interactive UI.
 * imageUrl is retained only for legacy backend responses and temporary
 * local object-URL previews. New uploads are attached with imageMediaId.
 */
export interface EventItem extends EventResponse {
  id: string;
  title: string;
  description: string;
  type: EventType;
  category: EventCategory;
  city: string;
  address: string;
  startDateTime: string;
  endDateTime: string;
  isFree: boolean;
  price: number;
  organizerName: string;
  status: EventStatus;
  interests: InterestResponse[];
  imageUrl?: string;
  displayCategory?: string;
  loopedCount?: number;
}

export interface EventCardModel {
  event: EventItem;
  displayCategory?: string;
  imagePreviewUrl?: string;
  isLooped?: boolean;
}

export type UserItem = UserResponse;

export interface GroupItem extends GroupResponse {
  id: string;
  eventId: string;
  adminId: string;
  adminUsername: string;
  title: string;
  groupSize: GroupSize;
  maxMembers: number;
  status: GroupStatus;
  groupNote: string;
  memberCount: number;
}

export interface JoinRequestItem
  extends GroupJoinRequestResponse {
  id: string;
  groupId: string;
  userId: string;
  status: GroupJoinRequestStatus;
  message: string;
}

export interface GroupMemberItem
  extends GroupMemberResponse {
  id: string;
  groupId: string;
  userId: string;
}

export type ProfilePayload = UpdateUserProfileRequest;
export type GroupPayload = CreateGroupRequest;
