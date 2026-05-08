import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "./constants";
import { findUserByCredentials, getAccountById } from "./store";
import type { Account, AccountId } from "./types";

interface SessionPayload {
  userId: AccountId;
  expiresAt: string;
}

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET env var is required");
  }
  return secret;
}

function sign(token: string) {
  return createHmac("sha256", getSecret()).update(token).digest("hex");
}

function createSessionCookie(userId: AccountId): string {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt })).toString("base64");
  return `${payload}.${sign(payload)}`;
}

function verifySessionCookie(cookie: string): AccountId | null {
  const [payload, signature] = cookie.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8")) as SessionPayload;
  if (new Date(decoded.expiresAt).getTime() < Date.now()) return null;
  const isValid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  return isValid ? decoded.userId : null;
}

export async function getCurrentUser(): Promise<Account | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const userId = verifySessionCookie(raw);
  if (!userId) return null;
  return getAccountById(userId);
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

export async function loginWithCredentials(handle: string, password: string) {
  const user = await findUserByCredentials(handle, password);
  if (!user) return null;
  const sessionCookie = createSessionCookie(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return user;
}

export async function logoutCurrentUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
