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

export interface SessionRecord {
  token: string;
  userId: AccountId;
  createdAt: string;
  expiresAt: string;
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
  sessions: SessionRecord[];
  letters: LetterRecord[];
  notifications: NotificationRecord[];
  automationRuns: AutomationRunRecord[];
}

export interface DashboardData {
  user: Account;
  drafts: LetterRecord[];
  published: LetterRecord[];
  notifications: NotificationRecord[];
}

export interface LetterDetailData {
  user: Account;
  letter: LetterRecord;
  isAuthor: boolean;
  recipients: Account[];
  spotifyTrack?: string;
  accent?: string;
}
