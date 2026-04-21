import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  ACCOUNT_LOOKUP,
  AUTHOR_ID,
  FIXED_ACCOUNTS,
  STORE_FILE,
  SEED_POEM_BODY,
  SEED_POEM_TITLE,
  getOtherAccountId,
} from "./constants";
import type {
  Account,
  AccountId,
  AppStore,
  AutomationRunRecord,
  DashboardData,
  LetterDetailData,
  LetterEventType,
  LetterRecord,
  LetterVersion,
  NotificationRecord,
  NotificationType,
  SessionRecord,
} from "./types";
import { createSupabaseAdmin, getSupabaseStateKey, isSupabaseConfigured } from "./supabase";

const DEFAULT_EXPIRY_DAYS = 30;

let writeQueue = Promise.resolve();

function dataPath() {
  return path.join(process.cwd(), STORE_FILE);
}

function now() {
  return new Date().toISOString();
}

function futureDate(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function poemSeedVersion(): LetterVersion {
  return {
    id: randomUUID(),
    type: "published",
    title: SEED_POEM_TITLE,
    body: SEED_POEM_BODY,
    authorId: AUTHOR_ID,
    createdAt: now(),
    summary: "Migrated from the original single-page love letter.",
  };
}

function createSeedStore(): AppStore {
  const version = poemSeedVersion();
  const createdAt = version.createdAt;

  return {
    schemaVersion: 1,
    accounts: [...FIXED_ACCOUNTS] as Account[],
    sessions: [],
    letters: [
      {
        id: randomUUID(),
        title: SEED_POEM_TITLE,
        body: SEED_POEM_BODY,
        authorId: AUTHOR_ID,
        status: "published",
        createdAt,
        updatedAt: createdAt,
        publishedAt: createdAt,
        recipientIds: [getOtherAccountId(AUTHOR_ID)],
        versions: [version],
      },
    ],
    notifications: [],
    automationRuns: [],
  };
}

async function ensureDirExists() {
  await fs.mkdir(path.dirname(dataPath()), { recursive: true });
}

async function readStore(): Promise<AppStore> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdmin();
    const stateKey = getSupabaseStateKey();
    const { data, error } = await supabase.from("app_state").select("data").eq("id", stateKey).maybeSingle();
    if (error) {
      throw error;
    }
    if (data?.data) {
      return data.data as AppStore;
    }

    const seed = createSeedStore();
    const { error: insertError } = await supabase.from("app_state").upsert({ id: stateKey, data: seed });
    if (insertError) {
      throw insertError;
    }
    return seed;
  }

  try {
    const raw = await fs.readFile(dataPath(), "utf8");
    const parsed = JSON.parse(raw) as AppStore;
    if (!parsed?.schemaVersion || parsed.schemaVersion !== 1) {
      throw new Error("Unsupported store schema");
    }
    return parsed;
  } catch {
    const seed = createSeedStore();
    await ensureDirExists();
    await fs.writeFile(dataPath(), JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
}

async function writeStore(store: AppStore) {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("app_state").upsert({
      id: getSupabaseStateKey(),
      data: store,
    });
    if (error) {
      throw error;
    }
    return;
  }

  await ensureDirExists();
  await fs.writeFile(dataPath(), JSON.stringify(store, null, 2), "utf8");
}

async function mutateStore<T>(mutator: (store: AppStore) => Promise<T> | T): Promise<T> {
  const run = writeQueue.then(async () => {
    const store = await readStore();
    const result = await mutator(store);
    await writeStore(store);
    return result;
  });

  writeQueue = run.then(
    () => undefined,
    () => undefined
  );

  return run;
}

function cloneLetter(letter: LetterRecord): LetterRecord {
  return {
    ...letter,
    recipientIds: [...letter.recipientIds],
    versions: letter.versions.map((version) => ({ ...version })),
  };
}

export function getAccountById(accountId: AccountId): Account {
  const account = ACCOUNT_LOOKUP[accountId];
  if (!account) {
    throw new Error(`Unknown account: ${accountId}`);
  }
  return account as Account;
}

export async function listAccounts() {
  return [...FIXED_ACCOUNTS] as Account[];
}

export async function getSession(token: string | undefined): Promise<SessionRecord | null> {
  if (!token) return null;

  const store = await readStore();
  const session = store.sessions.find((record) => record.token === token);
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await mutateStore((draft) => {
      draft.sessions = draft.sessions.filter((record) => record.token !== token);
    });
    return null;
  }

  return session;
}

export async function createSession(userId: AccountId): Promise<SessionRecord> {
  return mutateStore((store) => {
    const session: SessionRecord = {
      token: randomUUID(),
      userId,
      createdAt: now(),
      expiresAt: futureDate(DEFAULT_EXPIRY_DAYS),
    };
    store.sessions.push(session);
    return session;
  });
}

export async function deleteSession(token: string) {
  return mutateStore((store) => {
    store.sessions = store.sessions.filter((session) => session.token !== token);
  });
}

export async function findUserByCredentials(handle: string, password: string) {
  const normalized = handle.trim().toLowerCase();
  return (await listAccounts()).find((account) => account.handle === normalized && account.password === password) ?? null;
}

export async function getUserBySession(token: string | undefined) {
  const session = await getSession(token);
  if (!session) return null;
  return getAccountById(session.userId);
}

export async function getDashboardData(userId: AccountId): Promise<DashboardData> {
  const store = await readStore();
  const user = getAccountById(userId);
  const drafts = store.letters.filter((letter) => letter.authorId === userId && letter.status === "draft").map(cloneLetter);
  const published = store.letters.filter((letter) => letter.status === "published").map(cloneLetter);
  const notifications = store.notifications
    .filter((notification) => notification.userId === userId)
    .map((notification) => ({ ...notification }));

  return { user, drafts, published, notifications };
}

export async function getProfileData(accountId: AccountId) {
  const store = await readStore();
  const user = getAccountById(accountId);
  const drafts = store.letters.filter((letter) => letter.authorId === accountId && letter.status === "draft").map(cloneLetter);
  const published = store.letters.filter((letter) => letter.authorId === accountId && letter.status === "published").map(cloneLetter);
  return { user, drafts, published };
}

export async function getLetterDetail(letterId: string, userId: AccountId): Promise<LetterDetailData | null> {
  const store = await readStore();
  const letter = store.letters.find((record) => record.id === letterId);
  if (!letter) return null;

  const isAuthor = letter.authorId === userId;
  if (letter.status === "draft" && !isAuthor) return null;

  return {
    user: getAccountById(userId),
    letter: cloneLetter(letter),
    isAuthor,
    recipients: letter.recipientIds.map((recipientId) => getAccountById(recipientId)),
    spotifyTrack: letter.spotifyTrack,
    accent: letter.accent,
  };
}

export async function createDraftLetter(input: {
  authorId: AccountId;
  recipientId?: AccountId;
  title: string;
  body: string;
  spotifyTrack?: string;
  accent?: string;
}) {
  return mutateStore((store) => {
    const createdAt = now();
    const recipientId = input.recipientId ?? getOtherAccountId(input.authorId);
    const version: LetterVersion = {
      id: randomUUID(),
      type: "created",
      title: input.title,
      body: input.body,
      authorId: input.authorId,
      createdAt,
      summary: "Draft created.",
      spotifyTrack: input.spotifyTrack,
      accent: input.accent,
    };

    const letter: LetterRecord = {
      id: randomUUID(),
      title: input.title,
      body: input.body,
      authorId: input.authorId,
      status: "draft",
      createdAt,
      updatedAt: createdAt,
      publishedAt: null,
      recipientIds: [recipientId],
      spotifyTrack: input.spotifyTrack,
      accent: input.accent,
      versions: [version],
    };

    store.letters.unshift(letter);
    return cloneLetter(letter);
  });
}

export async function updateDraftLetter(input: {
  letterId: string;
  userId: AccountId;
  title: string;
  body: string;
  spotifyTrack?: string;
  accent?: string;
}) {
  return updateLetter(input);
}

export async function deleteDraftLetter(input: { letterId: string; userId: AccountId }) {
  return mutateStore((store) => {
    const letter = store.letters.find((record) => record.id === input.letterId);
    if (!letter) throw new Error("Letter not found");
    if (letter.authorId !== input.userId || letter.status !== "draft") {
      throw new Error("Forbidden");
    }
    store.letters = store.letters.filter((record) => record.id !== input.letterId);
  });
}

export async function updateLetter(input: {
  letterId: string;
  userId: AccountId;
  title: string;
  body: string;
  spotifyTrack?: string;
  accent?: string;
}) {
  return mutateStore((store) => {
    const letter = store.letters.find((record) => record.id === input.letterId);
    if (!letter) throw new Error("Letter not found");
    if (letter.authorId !== input.userId) throw new Error("Forbidden");

    const updatedAt = now();
    letter.title = input.title;
    letter.body = input.body;
    letter.spotifyTrack = input.spotifyTrack;
    letter.accent = input.accent;
    letter.updatedAt = updatedAt;
    letter.versions.push({
      id: randomUUID(),
      type: letter.status === "published" ? "updated" : "note",
      title: input.title,
      body: input.body,
      authorId: input.userId,
      createdAt: updatedAt,
      summary: letter.status === "published" ? "Published letter revised." : "Draft updated.",
      spotifyTrack: input.spotifyTrack,
      accent: input.accent,
    });

    if (letter.status === "published") {
      const message = `Se actualizó "${letter.title}".`;
      for (const recipientId of letter.recipientIds) {
        store.notifications.unshift({
          id: randomUUID(),
          userId: recipientId,
          type: "letter-updated",
          title: "Carta actualizada",
          message,
          createdAt: updatedAt,
          readAt: null,
          letterId: letter.id,
        });
      }
    }

    return cloneLetter(letter);
  });
}

export async function publishLetter(input: { letterId: string; userId: AccountId }) {
  return mutateStore((store) => {
    const letter = store.letters.find((record) => record.id === input.letterId);
    if (!letter) throw new Error("Letter not found");
    if (letter.authorId !== input.userId) throw new Error("Forbidden");

    const publishedAt = now();
    letter.status = "published";
    letter.publishedAt = letter.publishedAt ?? publishedAt;
    letter.updatedAt = publishedAt;
    letter.versions.push({
      id: randomUUID(),
      type: "published",
      title: letter.title,
      body: letter.body,
      authorId: input.userId,
      createdAt: publishedAt,
      summary: "Letter published for both users.",
      spotifyTrack: letter.spotifyTrack,
      accent: letter.accent,
    });

    for (const recipientId of letter.recipientIds) {
      store.notifications.unshift({
        id: randomUUID(),
        userId: recipientId,
        type: "letter-published",
        title: "Nueva carta publicada",
        message: `Se publicó "${letter.title}".`,
        createdAt: publishedAt,
        readAt: null,
        letterId: letter.id,
      });
    }

    return cloneLetter(letter);
  });
}

export async function getLetterById(letterId: string) {
  const store = await readStore();
  const letter = store.letters.find((record) => record.id === letterId);
  return letter ? cloneLetter(letter) : null;
}

export async function listDraftsForUser(userId: AccountId) {
  const store = await readStore();
  return store.letters.filter((letter) => letter.authorId === userId && letter.status === "draft").map(cloneLetter);
}

export async function listNotificationsForUser(userId: AccountId) {
  const store = await readStore();
  return store.notifications.filter((notification) => notification.userId === userId).map((notification) => ({ ...notification }));
}

export async function unreadNotificationCount(userId: AccountId) {
  const notifications = await listNotificationsForUser(userId);
  return notifications.filter((notification) => !notification.readAt).length;
}

export async function markNotificationRead(notificationId: string, userId: AccountId) {
  return mutateStore((store) => {
    const notification = store.notifications.find(
      (record) => record.id === notificationId && record.userId === userId
    );
    if (!notification) throw new Error("Notification not found");
    notification.readAt = notification.readAt ?? now();
  });
}

export async function createNotification(input: {
  userId: AccountId;
  type: NotificationType;
  title: string;
  message: string;
  letterId?: string;
}) {
  return mutateStore((store) => {
    const notification: NotificationRecord = {
      id: randomUUID(),
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      createdAt: now(),
      readAt: null,
      letterId: input.letterId,
    };
    store.notifications.unshift(notification);
    return notification;
  });
}

export async function recordAutomationRun(input: { provider: string; source: string; output: string }) {
  return mutateStore((store) => {
    const run: AutomationRunRecord = {
      id: randomUUID(),
      provider: input.provider,
      input: input.source,
      output: input.output,
      createdAt: now(),
    };
    store.automationRuns.unshift(run);
    return run;
  });
}

export async function listVisibleLetters(userId: AccountId) {
  const store = await readStore();
  return store.letters.filter((letter) => letter.status === "published" || letter.authorId === userId).map(cloneLetter);
}

export async function getAutomationRuns() {
  const store = await readStore();
  return store.automationRuns.map((run) => ({ ...run }));
}

export async function touchLetterSummary(letterId: string, summary: string, userId: AccountId, type: LetterEventType) {
  return mutateStore((store) => {
    const letter = store.letters.find((record) => record.id === letterId);
    if (!letter) throw new Error("Letter not found");
    const createdAt = now();
    letter.versions.push({
      id: randomUUID(),
      type,
      title: letter.title,
      body: letter.body,
      authorId: userId,
      createdAt,
      summary,
      spotifyTrack: letter.spotifyTrack,
      accent: letter.accent,
    });
    letter.updatedAt = createdAt;
    return cloneLetter(letter);
  });
}
