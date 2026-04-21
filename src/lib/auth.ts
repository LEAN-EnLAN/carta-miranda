import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "./constants";
import { createSession, deleteSession, findUserByCredentials, getUserBySession } from "./store";
import type { Account } from "./types";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required");
  }
  return secret;
}

function sign(token: string) {
  return createHmac("sha256", getSecret()).update(token).digest("hex");
}

function packToken(token: string) {
  return `${token}.${sign(token)}`;
}

function unpackToken(value: string | undefined) {
  if (!value) return null;
  const [token, signature] = value.split(".");
  if (!token || !signature) return null;
  const expected = sign(token);
  const isValid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  return isValid ? token : null;
}

export async function getCurrentUser(): Promise<Account | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const token = unpackToken(raw);
  return getUserBySession(token ?? undefined);
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

export async function loginWithCredentials(handle: string, password: string) {
  const user = await findUserByCredentials(handle, password);
  if (!user) return null;
  const session = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, packToken(session.token), {
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
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const token = unpackToken(raw);
  if (token) {
    await deleteSession(token);
  }
  cookieStore.delete(SESSION_COOKIE);
}
