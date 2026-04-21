import { NextResponse } from "next/server";
import { loginWithCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    console.log("Login request started");
    const formData = await request.formData();
    const handle = String(formData.get("username") ?? formData.get("handle") ?? "");
    const password = String(formData.get("password") ?? "");
    console.log("Login attempt for:", handle);

    const user = await loginWithCredentials(handle, password);
    if (!user) {
      console.log("Login failed: User not found or wrong password");
      return NextResponse.redirect(new URL("/?error=1", request.url));
    }

    console.log("Login success for:", handle);
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("CRITICAL LOGIN ERROR:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
