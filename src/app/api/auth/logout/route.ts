import { NextResponse } from "next/server";
import { logoutCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  await logoutCurrentUser();
  return NextResponse.redirect(new URL("/", request.url));
}
