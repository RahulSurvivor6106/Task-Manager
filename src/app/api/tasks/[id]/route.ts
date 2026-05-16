import { NextResponse } from "next/server";
import { canEditTask, canManageWorkspace } from "@/lib/permissions";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskPatchSchema } from "@/lib/validators";
import { toTaskSummary } from "@/lib/serializers";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromRequest(request as never);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existingTask = await prisma.task.findUnique({ where: { id }, include: { project: true, assignee: true, creator: true } });
  if (!existingTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (!canEditTask(user, existingTask.assigneeId)) {
    return NextResponse.json({ error: "You cannot update this task" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = taskPatchSchema.safeParse({ ...body, id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      order: parsed.data.order,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      labels: parsed.data.labels,
      projectId: parsed.data.projectId,
      assigneeId: parsed.data.assigneeId || undefined,
      activities: {
        create: {
          type: "task_updated",
          message: `${user.name} updated ${existingTask.title}`,
          userId: user.id,
        },
      },
    },
    include: { project: true, assignee: true, creator: true },
  });

  return NextResponse.json({ task: toTaskSummary(updatedTask) });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromRequest(request as never);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageWorkspace(user)) {
    return NextResponse.json({ error: "Only admins can delete tasks" }, { status: 403 });
  }

  const { id } = await context.params;
  const existingTask = await prisma.task.findUnique({ where: { id } });
  if (!existingTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
