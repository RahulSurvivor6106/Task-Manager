import { NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { canManageWorkspace } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { teamSchema } from "@/lib/validators";
import { toTeamSummary } from "@/lib/serializers";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request as never);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teams = await prisma.team.findMany({
    where: user.role === "ADMIN" ? undefined : { members: { some: { userId: user.id } } },
    include: { members: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ teams: teams.map(toTeamSummary) });
}

export async function POST(request: Request) {
  const user = await getCurrentUserFromRequest(request as never);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageWorkspace(user)) {
    return NextResponse.json({ error: "Only admins can create teams" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = teamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const team = await prisma.team.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      members: parsed.data.memberIds?.length
        ? {
            create: parsed.data.memberIds.map((memberId) => ({ userId: memberId })),
          }
        : undefined,
    },
    include: { members: true },
  });

  return NextResponse.json({ team: toTeamSummary(team) }, { status: 201 });
}
