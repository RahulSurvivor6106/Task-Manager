import { NextResponse } from "next/server";

export async function GET() {
  const db = process.env.DATABASE_URL ?? null;
  const mongo = process.env.MONGO_URL ?? null;

  // Mask sensitive parts
  const mask = (s: string | null) => {
    if (!s) return null;
    if (s.startsWith("file:")) return s;
    try {
      return s.replace(/(:\/\/)([^:@\/]+)(:[^@]+)?@/, (m) => `${m.split("@")[0]}@`);
    } catch {
      return "(masked)";
    }
  };

  return NextResponse.json({ databaseUrl: mask(db), mongoConfigured: Boolean(mongo) });
}
