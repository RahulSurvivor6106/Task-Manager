import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";
import { attachAuthCookie, signSession } from "@/lib/auth";
import * as mongoAuth from "@/lib/mongo-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    const user = await mongoAuth.verifyUserPassword(parsed.data.email, parsed.data.password);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const response = NextResponse.json({ user });
    attachAuthCookie(response, await signSession(user));
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to log in" }, { status: 500 });
  }
}
