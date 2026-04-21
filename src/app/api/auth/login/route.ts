import { NextResponse } from "next/server";
import { loginWithCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const handle = String(formData.get("username") ?? formData.get("handle") ?? "");
  const password = String(formData.get("password") ?? "");

  const user = await loginWithCredentials(handle, password);
  if (!user) {
    return NextResponse.redirect(new URL("/?error=1", request.url));
  }

  return NextResponse.redirect(new URL("/", request.url));
}
