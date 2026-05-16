import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import type { AuthUser, Role } from "./contracts";
import { AUTH_COOKIE_NAME } from "./auth-cookie";

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function signSession(user: AuthUser) {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySession(token: string) {
  const result = await jwtVerify(token, getSecretKey());
  return {
    userId: result.payload.sub,
    role: result.payload.role as Role | undefined,
  };
}

export async function getCurrentUserFromToken(token?: string | null): Promise<AuthUser | null> {
  if (!token) {
    return null;
  }

  try {
    const session = await verifySession(token);
    if (!session.userId) {
      return null;
    }

    const { findUserById } = await import("./mongo-auth");
    return findUserById(session.userId);
  } catch {
    return null;
  }
}

export async function getCurrentUserFromCookies(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return getCurrentUserFromToken(token);
}

export async function getCurrentUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return getCurrentUserFromToken(token);
}

export function attachAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
