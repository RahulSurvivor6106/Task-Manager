import { isBefore } from "date-fns";
import type {
  ActivitySummary,
  AuthUser,
  DashboardStats,
  NotificationSummary,
  Priority,
  ProjectSummary,
  TaskStatus,
  TaskSummary,
  TeamSummary,
} from "./contracts";

type SerializableUser = {
  id: string;
  name: string;
  email: string;
  role: AuthUser["role"];
  title?: string | null;
  avatarUrl?: string | null;
};

type SerializableTeamMember = {
  id: string;
};

type SerializableTeam = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  members?: SerializableTeamMember[];
};

type SerializableProject = {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  status: "ACTIVE" | "ARCHIVED";
  color: string;
  dueDate?: Date | null;
  team?: { name: string } | null;
  tasks?: Array<{ status: TaskStatus }>;
};

type SerializableTask = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  order: number;
  dueDate?: Date | null;
  labels?: unknown;
  projectId: string;
  project: { name: string; key: string; color: string };
  assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
  creator?: { id: string; name: string } | null;
};

type SerializableActivity = {
  id: string;
  type: string;
  message: string;
  createdAt: Date;
  user?: { id: string; name: string } | null;
};

type SerializableNotification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
};

function toIso(value?: Date | null) {
  return value ? value.toISOString() : null;
}

function parseLabels(labels: unknown) {
  if (Array.isArray(labels)) {
    return labels.filter((item): item is string => typeof item === "string");
  }

  return [];
}

export function toAuthUser(user: SerializableUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    title: user.title,
    avatarUrl: user.avatarUrl,
  };
}

export function toTeamSummary(team: SerializableTeam): TeamSummary {
  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    description: team.description,
    memberCount: team.members?.length ?? 0,
  };
}

export function toProjectSummary(project: SerializableProject): ProjectSummary {
  const tasks = project.tasks ?? [];
  const completedCount = tasks.filter((task) => task.status === "DONE").length;

  return {
    id: project.id,
    name: project.name,
    key: project.key,
    description: project.description,
    status: project.status,
    color: project.color,
    teamName: project.team?.name ?? "Team",
    dueDate: toIso(project.dueDate),
    taskCount: tasks.length,
    completedCount,
  };
}

export function toTaskSummary(task: SerializableTask): TaskSummary {
  const dueDate = toIso(task.dueDate);
  const overdue = Boolean(dueDate && task.status !== "DONE" && isBefore(new Date(dueDate), new Date()));

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status as TaskStatus,
    priority: task.priority as Priority,
    order: task.order,
    dueDate,
    labels: parseLabels(task.labels),
    projectId: task.projectId,
    projectName: task.project.name,
    projectKey: task.project.key,
    projectColor: task.project.color,
    assignee: task.assignee
      ? { id: task.assignee.id, name: task.assignee.name, avatarUrl: task.assignee.avatarUrl }
      : null,
    creator: task.creator ? { id: task.creator.id, name: task.creator.name } : null,
    overdue,
  };
}

export function toActivitySummary(activity: SerializableActivity): ActivitySummary {
  return {
    id: activity.id,
    type: activity.type,
    message: activity.message,
    createdAt: activity.createdAt.toISOString(),
    actor: activity.user ? { id: activity.user.id, name: activity.user.name } : null,
  };
}

export function toNotificationSummary(notification: SerializableNotification): NotificationSummary {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    createdAt: notification.createdAt.toISOString(),
  };
}

export function computeStats(tasks: TaskSummary[], projects: ProjectSummary[]): DashboardStats {
  const completedTasks = tasks.filter((task) => task.status === "DONE").length;
  const overdueTasks = tasks.filter((task) => task.overdue).length;
  const openTasks = tasks.filter((task) => task.status !== "DONE").length;
  const productivity = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  return {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    openTasks,
    overdueTasks,
    completedTasks,
    productivity,
  };
}

export function buildWeeklyTrend(tasks: TaskSummary[]) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, index) => ({
    day,
    completed: tasks.filter((task) => task.status === "DONE").slice(0, index + 2).length,
    overdue: tasks.filter((task) => task.overdue).slice(0, index + 1).length,
  }));
}
