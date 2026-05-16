import { getCurrentUserFromCookies } from "./auth";
import { prisma } from "./prisma";
import { buildWeeklyTrend, computeStats, toActivitySummary, toAuthUser, toNotificationSummary, toProjectSummary, toTaskSummary, toTeamSummary } from "./serializers";
import type { DashboardData, AdminStats, AdminUserTaskStats } from "./contracts";

export async function getDashboardData(): Promise<DashboardData> {
  const user = await getCurrentUserFromCookies();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const [teams, projects, tasks, activities, notifications] = await Promise.all([
      prisma.team.findMany({
        where: user.role === "ADMIN" ? undefined : { members: { some: { userId: user.id } } },
        include: { members: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.findMany({
        where: user.role === "ADMIN" ? undefined : { team: { members: { some: { userId: user.id } } } },
        include: { team: true, tasks: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.task.findMany({
        where:
          user.role === "ADMIN"
            ? undefined
            : { OR: [{ assigneeId: user.id }, { project: { team: { members: { some: { userId: user.id } } } } }] },
        include: { project: true, assignee: true, creator: true },
        orderBy: [{ updatedAt: "desc" }],
      }),
      prisma.activity.findMany({
        where:
          user.role === "ADMIN"
            ? undefined
            : { OR: [{ userId: user.id }, { project: { team: { members: { some: { userId: user.id } } } } }] },
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    const taskSummaries = tasks.map(toTaskSummary);
    const projectSummaries = projects.map(toProjectSummary);

    const base: DashboardData = {
      user: toAuthUser(user),
      teams: teams.map(toTeamSummary),
      projects: projectSummaries,
      tasks: taskSummaries,
      activities: activities.map(toActivitySummary),
      notifications: notifications.map(toNotificationSummary),
      stats: computeStats(taskSummaries, projectSummaries),
      weeklyTrend: buildWeeklyTrend(taskSummaries),
    };

    // compute admin-only stats
    if (user.role === "ADMIN") {
      const totalUsers = await prisma.user.count();

      const byUserMap: Record<string, AdminUserTaskStats> = {};
      for (const t of taskSummaries) {
        const assignee = t.assignee;
        if (!assignee) continue;
        const id = assignee.id;
        if (!byUserMap[id]) byUserMap[id] = { id, name: assignee.name, totalTasks: 0, completedTasks: 0, openTasks: 0 };
        byUserMap[id].totalTasks += 1;
        if (t.status === "DONE") byUserMap[id].completedTasks += 1;
        else byUserMap[id].openTasks += 1;
      }

      const adminStats: AdminStats = {
        totalUsers,
        users: Object.values(byUserMap).sort((a, b) => b.totalTasks - a.totalTasks),
      };

      // attach adminStats to base via type assertion (dashboard component will read it optionally)
      return Object.assign(base, { adminStats });
    }

    return base;
  } catch (error) {
    console.warn("Dashboard data load failed, returning empty dashboard:", error);
    return {
      user: toAuthUser(user),
      teams: [],
      projects: [],
      tasks: [],
      activities: [],
      notifications: [],
      stats: {
        totalProjects: 0,
        totalTasks: 0,
        openTasks: 0,
        overdueTasks: 0,
        completedTasks: 0,
        productivity: 0,
      },
      weeklyTrend: [
        { day: "Mon", completed: 0, overdue: 0 },
        { day: "Tue", completed: 0, overdue: 0 },
        { day: "Wed", completed: 0, overdue: 0 },
        { day: "Thu", completed: 0, overdue: 0 },
        { day: "Fri", completed: 0, overdue: 0 },
        { day: "Sat", completed: 0, overdue: 0 },
        { day: "Sun", completed: 0, overdue: 0 },
      ],
    };
  }
}
