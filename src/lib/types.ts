export type AccountId = "leandro" | "miranda";

export type LetterStatus = "draft" | "published";

export type LetterEventType =
  | "created"
  | "updated"
  | "published"
  | "automation"
  | "note";

export type NotificationType =
  | "login"
  | "letter-created"
  | "letter-updated"
  | "letter-published"
  | "automation";

export interface Account {
  id: AccountId;
  handle: string;
  displayName: string;
  password: string;
  bio: string;
  accent: string;
}

export interface LetterVersion {
  id: string;
  type: LetterEventType;
  title: string;
  body: string;
  authorId: AccountId;
  createdAt: string;
  summary: string;
  spotifyTrack?: string;
  accent?: string;
}

export interface LetterRecord {
  id: string;
  title: string;
  body: string;
  authorId: AccountId;
  status: LetterStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  recipientIds: AccountId[];
  spotifyTrack?: string;
  accent?: string;
  versions: LetterVersion[];
}

export interface NotificationRecord {
  id: string;
  userId: AccountId;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
  letterId?: string;
}

export interface AutomationRunRecord {
  id: string;
  provider: string;
  input: string;
  output: string;
  createdAt: string;
}

export interface AppStore {
  schemaVersion: 1;
  accounts: Account[];
  letters: LetterRecord[];
  notifications: NotificationRecord[];
  automationRuns: AutomationRunRecord[];
  pushSubscriptions: PushSubscription[];
}

export interface DashboardData {
  user: Account;
  drafts: LetterRecord[];
  published: LetterRecord[];
  notifications: NotificationRecord[];
}

export interface FeedLetterItem {
  kind: "letter";
  id: string;
  createdAt: string;
  cursor: string;
  letter: LetterRecord;
  visibleToViewer: boolean;
  versionCount: number;
}

export interface FeedActivityItem {
  kind: "activity";
  id: string;
  createdAt: string;
  cursor: string;
  notification: NotificationRecord;
}

export type FeedItem = FeedLetterItem | FeedActivityItem;

export interface FeedPage {
  items: FeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
  pageSize: number;
  total: number;
  empty: boolean;
}

export interface RelationshipSummary {
  viewer: Account;
  partner: Account;
  partnerId: AccountId;
  conversationLabel: string;
  conversationSubtitle: string;
  sharedLetterCount: number;
  draftCount: number;
  unreadNotificationCount: number;
  lastActivityAt: string | null;
  recentPulseCount: number;
}

export interface ComposerDraft {
  recipientId: AccountId;
  title: string;
  body: string;
  spotifyTrack?: string;
  accent: string;
  updatedAt: string;
}

export interface LetterDetailData {
  user: Account;
  letter: LetterRecord;
  isAuthor: boolean;
  recipients: Account[];
  spotifyTrack?: string;
  accent?: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: string;
  userAgent?: string;
}
