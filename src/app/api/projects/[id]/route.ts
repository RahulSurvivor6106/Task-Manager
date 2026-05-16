import { NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { canManageWorkspace } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validators";
import { toProjectSummary } from "@/lib/serializers";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromRequest(request as never);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageWorkspace(user)) {
    return NextResponse.json({ error: "Only admins can update projects" }, { status: 403 });
  }

  const { id } = await context.params;
  const existing = await prisma.project.findUnique({ where: { id }, include: { team: true, tasks: true } });
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = projectSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      name: parsed.data.name,
      key: parsed.data.key,
      description: parsed.data.description,
      status: parsed.data.status,
      color: parsed.data.color,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      teamId: parsed.data.teamId,
    },
    include: { team: true, tasks: true },
  });

  return NextResponse.json({ project: toProjectSummary(updatedProject) });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromRequest(request as never);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageWorkspace(user)) {
    return NextResponse.json({ error: "Only admins can delete projects" }, { status: 403 });
  }

  const { id } = await context.params;
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
