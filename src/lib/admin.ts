import { prisma } from "./prisma";
import type { AdminStats } from "./contracts";
import bcrypt from "bcryptjs";

export type AdminUsersQuery = {
  page?: number;
  perPage?: number;
  sort?: "tasks" | "name";
  teamId?: string | null;
  search?: string | null;
};

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true } });

    const stats = await Promise.all(
      users.map(async (u) => {
        const total = await prisma.task.count({ where: { assigneeId: u.id } });
        const completed = await prisma.task.count({ where: { assigneeId: u.id, status: "DONE" } });
        const open = total - completed;
        return { id: u.id, name: u.name, totalTasks: total, completedTasks: completed, openTasks: open };
      })
    );

    return {
      totalUsers: users.length,
      users: stats.sort((a, b) => b.totalTasks - a.totalTasks),
    };
  } catch (error) {
    console.warn("Admin stats load failed, database unavailable:", error);
    return { totalUsers: 0, users: [] };
  }
}

export async function getAdminUsers(opts: AdminUsersQuery = {}) {
  const page = opts.page && opts.page > 0 ? opts.page : 1;
  const perPage = opts.perPage && opts.perPage > 0 ? opts.perPage : 20;

  const where: any = {};
  if (opts.search) {
    const s = opts.search.trim();
    where.OR = [{ name: { contains: s, mode: "insensitive" } }, { email: { contains: s, mode: "insensitive" } }];
  }
  if (opts.teamId) {
    where.teams = { some: { id: opts.teamId } };
  }

  try {
    const total = await prisma.user.count({ where });

    const users = await prisma.user.findMany({
      where,
      orderBy: opts.sort === "name" ? { name: "asc" } : undefined,
      skip: (page - 1) * perPage,
      take: perPage,
      select: { id: true, name: true, email: true },
    });

    const rows = await Promise.all(
      users.map(async (u) => {
        const totalTasks = await prisma.task.count({ where: { assigneeId: u.id } });
        const completedTasks = await prisma.task.count({ where: { assigneeId: u.id, status: "DONE" } });
        return { id: u.id, name: u.name, email: u.email, totalTasks, completedTasks, openTasks: totalTasks - completedTasks };
      })
    );

    if (opts.sort === "tasks") rows.sort((a, b) => b.totalTasks - a.totalTasks);

    return { users: rows, total, page, perPage };
  } catch (error) {
    console.warn("getAdminUsers failed, database unavailable:", error);
    return { users: [], total: 0, page, perPage };
  }
}

export async function inviteUser(name: string, email: string, role: "ADMIN" | "MEMBER" = "MEMBER") {
  const password = Math.random().toString(36).slice(-8) + "!";
  const passwordHash = bcrypt.hashSync(password, 12);
  try {
    const user = await prisma.user.create({ data: { name, email, role, passwordHash } as any });
    return { user, password };
  } catch (error) {
    console.error("inviteUser failed:", error);
    throw error;
  }
}

export async function removeUser(id: string) {
  try {
    return await prisma.user.delete({ where: { id } });
  } catch (error) {
    console.error("removeUser failed:", error);
    throw error;
  }
}

export async function listTeams() {
  try {
    return await prisma.team.findMany({ select: { id: true, name: true } });
  } catch (error) {
    console.warn("listTeams failed, returning empty list:", error);
    return [];
  }
}

export default getAdminStats;
