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

export type UserProfileResponse = SchemaOf<"UserProfileResponse">;
export type UpdateUserProfileRequest = SchemaOf<"UpdateUserProfileRequest">;

// Events
// NOTE: The generated EventResponse has all fields as optional (backend may return partial responses).
// EventItem below uses this type as-is. Callers must guard against undefined fields.
export type EventResponse = SchemaOf<"EventResponse">;
export type EventCreateRequest = SchemaOf<"EventCreateRequest">;
export type EventUpdateRequest = SchemaOf<"EventUpdateRequest">;

// LoopedEventResponse — use generated alias
export type LoopedEventResponse = SchemaOf<"LoopedEventResponse">;

/**
 * EventCardModel separates frontend-only display fields from the backend DTO.
 * Use this type when you need to merge display-only state with the raw EventResponse.
 */
export interface EventCardModel {
  event: EventResponse;
  displayCategory?: string;
  imagePreviewUrl?: string;
  isLooped?: boolean;
}

// Groups — use generated schema aliases
export type GroupResponse = SchemaOf<"GroupResponse">;
export type CreateGroupRequest = SchemaOf<"CreateGroupRequest">;
export type UpdateGroupRequest = SchemaOf<"UpdateGroupRequest">;
export type UpdateGroupStatusRequest = SchemaOf<"UpdateGroupStatusRequest">;

// Group Members
export type GroupMemberResponse = SchemaOf<"GroupMemberResponse">;
export type GroupMemberRequest = SchemaOf<"GroupMemberRequest">;

// Group Join Requests — use generated schema alias
export type GroupJoinRequestResponse = SchemaOf<"GroupJoinRequestResponse">;
export type CreateGroupJoinRequestRequest = SchemaOf<"CreateGroupJoinRequestRequest">;

// Messages — use generated schema alias
export type GroupMessageResponse = SchemaOf<"GroupMessageResponse">;
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
export type MediaPurpose = "EVENT_IMAGE" | "GROUP_IMAGE" | "PROFILE_AVATAR";

/**
 * Compatibility aliases — retained for existing callers.
 * The canonical type names (EventResponse, GroupResponse, etc.) should be used in new code.
 */
/**
 * Complete model consumed by interactive UI.  It is deliberately separate from
 * the generated DTO: API responses are partial according to OpenAPI and must
 * be normalized at the API boundary before rendering.
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
  /** Frontend-only presentation state; never sent to the API. */
  displayCategory?: string;
  /** Frontend-only count supplied by loop-in endpoints when available. */
  loopedCount?: number;
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
export interface JoinRequestItem extends GroupJoinRequestResponse {
  id: string;
  groupId: string;
  userId: string;
  status: GroupJoinRequestStatus;
  message: string;
}
export type ProfilePayload = UserProfileResponse;
export type GroupPayload = CreateGroupRequest;
export interface GroupMemberItem extends GroupMemberResponse {
  id: string;
  groupId: string;
  userId: string;
}

/**
 * EventPayload — a frontend form-state type for event creation/editing.
 * Derived from EventResponse for backward compatibility with existing form code.
 *
 * @deprecated For new mutations, use EventCreateRequest or EventUpdateRequest directly.
 */
export interface EventPayload extends EventCreateRequest {
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  imageUrl: string;
  status?: EventStatus;
}
