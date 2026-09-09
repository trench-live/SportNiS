// Типы, зеркалящие DTO бэкенда (com.sportnis.api.*).
// Держим синхронно с Java-контрактом.

export type ProfileType = "CONSUMER" | "PROVIDER";
export type ListingType = "OFFER";
export type ListingFormat = "ONLINE" | "OFFLINE" | "HYBRID";
export type ListingStatus = "PUBLISHED" | "ARCHIVED" | "CLOSED";
export type ListingReplyStatus = "NEW" | "ACCEPTED" | "REJECTED";
export type ProfileCompletionStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type OnboardingStep = "REGISTERED" | "PROFILE_BASICS_FILLED" | "DONE";
export type AccountStatus = "ACTIVE" | "BLOCKED" | "ON_REVIEW" | "DELETED";
export type SystemRole = "USER" | "ADMIN" | "SUPPORT" | "PARTNER";
export type FeedItemType = "CONSUMER_PROFILE" | "PROVIDER_LISTING";

// --- Auth ---
export interface RegisterRequest {
  email?: string | null;
  phone?: string | null;
  password: string;
  profileType: ProfileType;
}

export interface LoginRequest {
  email?: string | null;
  phone?: string | null;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  profileId: string;
  profileType: ProfileType;
}

export interface AuthMeResponse {
  userId: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  status: AccountStatus;
  systemRole: SystemRole;
  onboardingStep: OnboardingStep;
  profileId: string;
  profileType: ProfileType;
}

// --- Profile ---
export interface ProfileResponse {
  id: string;
  userId: string;
  profileType: ProfileType;
  displayName: string;
  avatarUrl: string | null;
  city: string | null;
  about: string | null;
  sportsTags: string[];
  isLookingFor: boolean | null;
  completionStatus: ProfileCompletionStatus;
  missingFields: string[];
}

export interface MyProfileItemResponse {
  id: string;
  profileType: ProfileType;
  displayName: string;
  isLookingFor: boolean | null;
  active: boolean;
}

export interface ProfileUpdateRequest {
  displayName: string;
  avatarUrl?: string | null;
  city?: string | null;
  about?: string | null;
  sportsTags: string[];
}

export interface ProfileCreateRequest {
  profileType: ProfileType;
  displayName: string;
}

// --- Listing ---
export interface ListingResponse {
  id: string;
  ownerProfileId: string;
  type: ListingType;
  status: ListingStatus;
  title: string;
  description: string;
  contactInfo: string | null;
  contactVisibleForMe: boolean;
  tags: string[];
  city: string | null;
  format: ListingFormat;
  priceFrom: number | null;
  priceTo: number | null;
  currency: string;
  expiresAt: string | null;
  manualCloseOnly: boolean;
  createdAt: string;
  updatedAt: string;
  myReplyStatus: ListingReplyStatus | null;
}

export interface ListingCreateRequest {
  type: ListingType;
  title: string;
  description: string;
  contactInfo?: string | null;
  tags: string[];
  city?: string | null;
  format: ListingFormat;
  priceFrom?: string | number | null;
  priceTo?: string | number | null;
  expiresAt?: string | null;
  manualCloseOnly: boolean;
}

export type ListingUpdateRequest = Omit<ListingCreateRequest, "type">;

export interface ListingReplyCreateRequest {
  message?: string | null;
}

export interface ListingReplyResponse {
  id: string;
  listingId: string;
  responderProfileId: string;
  message: string | null;
  status: ListingReplyStatus;
  createdAt: string;
  updatedAt: string;
}

// --- Feed ---
export interface FeedItemResponse {
  itemType: FeedItemType;
  itemId: string;
  profileId: string;
  profileType: ProfileType;
  title: string;
  subtitle: string | null;
  ownerDisplayName: string;
  avatarUrl: string | null;
  city: string | null;
  tags: string[];
  format: ListingFormat | null;
  priceFrom: number | null;
  priceTo: number | null;
  currency: string | null;
  createdAt: string;
}

export interface FeedResponse {
  items: FeedItemResponse[];
  total: number;
  page: number;
  size: number;
  hasNext: boolean;
}

export interface FeedQuery {
  page?: number;
  size?: number;
  city?: string;
  tag?: string;
}
