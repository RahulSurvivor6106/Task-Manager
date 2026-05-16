import { NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toNotificationSummary } from "@/lib/serializers";
import connectMongo, { getCollection } from "@/lib/mongo";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request as never);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If a Mongo URL is configured, read notifications from Mongo
  if (process.env.MONGO_URL) {
    await connectMongo();
    const coll = getCollection("notifications");
    if (coll) {
      const docs = await coll
        .find({ userId: String(user.id) })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();
      return NextResponse.json({ notifications: docs.map((d) => toNotificationSummary({ ...d, id: String(d._id) } as any)) });
    }
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ notifications: notifications.map(toNotificationSummary) });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUserFromRequest(request as never);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (body?.id) {
    if (process.env.MONGO_URL) {
      await connectMongo();
      const coll = getCollection("notifications");
      if (coll) {
        await coll.updateOne({ _id: new (require("mongodb").ObjectId)(String(body.id)) }, { $set: { read: true } });
      }
    } else {
      await prisma.notification.update({ where: { id: String(body.id) }, data: { read: true } });
    }
  } else {
    if (process.env.MONGO_URL) {
      await connectMongo();
      const coll = getCollection("notifications");
      if (coll) {
        await coll.updateMany({ userId: String(user.id) }, { $set: { read: true } });
      }
    } else {
      await prisma.notification.updateMany({ where: { userId: user.id }, data: { read: true } });
    }
  }

  return NextResponse.json({ ok: true });
}
