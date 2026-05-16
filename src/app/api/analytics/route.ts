import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard";
import connectMongo, { getCollection } from "@/lib/mongo";

export async function GET() {
  try {
    // If Mongo is configured and has a cached dashboard document, use it.
    if (process.env.MONGO_URL) {
      await connectMongo();
      const coll = getCollection("analytics");
      if (coll) {
        const cached = await coll.findOne({ key: "dashboard" });
        if (cached?.stats && cached?.weeklyTrend) {
          return NextResponse.json({ stats: cached.stats, weeklyTrend: cached.weeklyTrend });
        }
      }
    }

    const dashboard = await getDashboardData();
    return NextResponse.json({ stats: dashboard.stats, weeklyTrend: dashboard.weeklyTrend });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
