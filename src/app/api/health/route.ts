import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import connectMongo from "@/lib/mongo";

export async function GET() {
  const result: any = { postgres: { ok: false }, mongo: { ok: false } };

  try {
    // simple query to verify Postgres/Prisma
    await prisma.$queryRaw`SELECT 1`;
    result.postgres.ok = true;
  } catch (error: any) {
    result.postgres.ok = false;
    result.postgres.error = String(error?.message ?? error);
  }

  try {
    const m = await connectMongo();
    if (m) {
      result.mongo.ok = true;
    } else {
      result.mongo.ok = false;
      result.mongo.error = "MONGO_URL not configured or connection failed";
    }
  } catch (error: any) {
    result.mongo.ok = false;
    result.mongo.error = String(error?.message ?? error);
  }

  return NextResponse.json(result);
}
