import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validators";
import { attachAuthCookie, hashPassword, signSession } from "@/lib/auth";
import { toAuthUser } from "@/lib/serializers";
import * as mongoAuth from "@/lib/mongo-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    
    const existingUser = await mongoAuth.findUserByEmail(parsed.data.email);
    if (existingUser) {
      return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 });
    }

    const user = await mongoAuth.createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      title: parsed.data.title,
    });

    const response = NextResponse.json({ user }, { status: 201 });
    attachAuthCookie(response, await signSession(user));
    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to sign up" }, { status: 500 });
  }
}
