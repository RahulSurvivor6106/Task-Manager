import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { findUserById } from "@/lib/mongo-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const token = cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`))
      ?.slice(`${AUTH_COOKIE_NAME}=`.length);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifySession(token);
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
