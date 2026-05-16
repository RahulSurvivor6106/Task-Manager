export type Role = "ADMIN" | "MEMBER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  title?: string | null;
  avatarUrl?: string | null;
};

export type TeamSummary = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  memberCount: number;
};

export type ProjectSummary = {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  status: "ACTIVE" | "ARCHIVED";
  color: string;
  teamName: string;
  dueDate?: string | null;
  taskCount: number;
  completedCount: number;
};

export type TaskSummary = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  order: number;
  dueDate?: string | null;
  labels: string[];
  projectId: string;
  projectName: string;
  projectKey: string;
  projectColor: string;
  assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
  creator?: { id: string; name: string } | null;
  overdue: boolean;
};

export type ActivitySummary = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  actor?: { id: string; name: string } | null;
};

export type NotificationSummary = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type DashboardStats = {
  totalProjects: number;
  totalTasks: number;
  openTasks: number;
  overdueTasks: number;
  completedTasks: number;
  productivity: number;
};

export type DashboardData = {
  user: AuthUser;
  teams: TeamSummary[];
  projects: ProjectSummary[];
  tasks: TaskSummary[];
  activities: ActivitySummary[];
  notifications: NotificationSummary[];
  stats: DashboardStats;
  weeklyTrend: Array<{ day: string; completed: number; overdue: number }>;
};

// optional admin-only stats included when the current user is an admin
export type DashboardDataWithAdmin = DashboardData & { adminStats?: AdminStats };

export type AdminUserTaskStats = {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
};

export type AdminStats = {
  totalUsers: number;
  users: AdminUserTaskStats[];
};
