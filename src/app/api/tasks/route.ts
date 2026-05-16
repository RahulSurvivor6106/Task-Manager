import { NextResponse } from "next/server";
import { canEditTask, canManageWorkspace } from "@/lib/permissions";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskQuerySchema, taskSchema } from "@/lib/validators";
import { toTaskSummary } from "@/lib/serializers";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request as never);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = taskQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams.entries()));
  if (!query.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const tasks = await prisma.task.findMany({
    where:
      user.role === "ADMIN"
        ? {
            ...(query.data.projectId ? { projectId: query.data.projectId } : {}),
            ...(query.data.status ? { status: query.data.status } : {}),
            ...(query.data.assigneeId ? { assigneeId: query.data.assigneeId } : {}),
            ...(query.data.search
              ? {
                  OR: [
                    { title: { contains: query.data.search, mode: "insensitive" } },
                    { description: { contains: query.data.search, mode: "insensitive" } },
                  ],
                }
              : {}),
          }
        : {
            OR: [{ assigneeId: user.id }, { project: { team: { members: { some: { userId: user.id } } } } }],
            ...(query.data.projectId ? { projectId: query.data.projectId } : {}),
            ...(query.data.status ? { status: query.data.status } : {}),
            ...(query.data.assigneeId ? { assigneeId: query.data.assigneeId } : {}),
            ...(query.data.search
              ? {
                  OR: [
                    { title: { contains: query.data.search, mode: "insensitive" } },
                    { description: { contains: query.data.search, mode: "insensitive" } },
                  ],
                }
              : {}),
          },
    include: { project: true, assignee: true, creator: true },
    orderBy: [{ updatedAt: "desc" }],
  });

  return NextResponse.json({ tasks: tasks.map(toTaskSummary) });
}

export async function POST(request: Request) {
  const user = await getCurrentUserFromRequest(request as never);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageWorkspace(user)) {
    return NextResponse.json({ error: "Only admins can create tasks" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const task = await prisma.task.create({
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
      creatorId: user.id,
      activities: {
        create: {
          type: "task_created",
          message: `${user.name} created task ${parsed.data.title}`,
          userId: user.id,
        },
      },
    },
    include: { project: true, assignee: true, creator: true },
  });

  return NextResponse.json({ task: toTaskSummary(task) }, { status: 201 });
}
