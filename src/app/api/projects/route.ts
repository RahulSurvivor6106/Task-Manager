import { NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { canManageWorkspace } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validators";
import { toProjectSummary } from "@/lib/serializers";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request as never);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: user.role === "ADMIN" ? undefined : { team: { members: { some: { userId: user.id } } } },
    include: { team: true, tasks: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ projects: projects.map(toProjectSummary) });
}

export async function POST(request: Request) {
  const user = await getCurrentUserFromRequest(request as never);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageWorkspace(user)) {
    return NextResponse.json({ error: "Only admins can create projects" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      key: parsed.data.key,
      description: parsed.data.description,
      status: parsed.data.status,
      color: parsed.data.color,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      teamId: parsed.data.teamId,
      ownerId: user.id,
      tasks: {
        create: [],
      },
    },
    include: { team: true, tasks: true },
  });

  return NextResponse.json({ project: toProjectSummary(project) }, { status: 201 });
}
