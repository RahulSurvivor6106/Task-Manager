"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DndContext, PointerSensor, closestCenter, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, Layers3, LayoutDashboard, ListFilter, Plus, Search, Settings2, Sparkles, Trash2, Users } from "lucide-react";
import type { DashboardData, TaskStatus, TaskSummary } from "@/lib/contracts";
import { taskSchema } from "@/lib/validators";
import { priorities, priorityLabels, taskStatusLabels, taskStatuses } from "@/lib/constants";
import { Avatar, AvatarFallback, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input, Label, Textarea } from "@/components/ui";
import ProjectDialog from "@/components/project-dialog";
import { cn } from "@/lib/utils";
import type { z } from "zod";

type TaskFormValues = Omit<z.input<typeof taskSchema>, "labels"> & { labels: string };
type TaskSubmitValues = Omit<TaskFormValues, "labels"> & { labels: string[] };

export function Dashboard({ data }: { data: DashboardData }) {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskSummary[]>(data.tasks);
  const [projects, setProjects] = useState(data.projects);
  const [search, setSearch] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(data.projects[0]?.id ?? "all");
  const [editingTask, setEditingTask] = useState<TaskSummary | null>(null);
  const [creatingTaskOpen, setCreatingTaskOpen] = useState(false);
  const [creatingProjectOpen, setCreatingProjectOpen] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const text = `${task.title} ${task.description ?? ""} ${task.assignee?.name ?? ""}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (selectedProjectId === "all" || task.projectId === selectedProjectId);
  }), [search, selectedProjectId, tasks]);

  const tasksByStatus = useMemo(() => taskStatuses.reduce<Record<TaskStatus, TaskSummary[]>>((groups, status) => {
    groups[status] = filteredTasks.filter((task) => task.status === status);
    return groups;
  }, { TODO: [], IN_PROGRESS: [], BLOCKED: [], DONE: [] }), [filteredTasks]);

  const chartData = data.weeklyTrend.map((point) => ({ ...point, total: point.completed + point.overdue }));
  const uniqueAssignees = Array.from(new Map(tasks.map((task) => task.assignee).filter(Boolean).map((member) => [member!.id, member!])).values());
  const isAdmin = data.user.role === "ADMIN";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function saveTask(values: TaskSubmitValues, taskId?: string) {
    const response = await fetch(taskId ? `/api/tasks/${taskId}` : "/api/tasks", {
      method: taskId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to save task");
    }

    setTasks((current) => (taskId ? current.map((entry) => (entry.id === taskId ? payload.task : entry)) : [payload.task, ...current]));
    toast.success(taskId ? "Task updated" : "Task created");
  }

  async function saveProject(values: any) {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to save project");
    }

    setProjects((current) => [payload.project, ...current]);
    toast.success("Project created");
  }

  async function deleteTask(taskId: string) {
    const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to delete task");
    }
    setTasks((current) => current.filter((task) => task.id !== taskId));
    toast.success("Task deleted");
  }

  function moveTask(taskId: string, status: TaskStatus) {
    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask) return;

    const optimistic = { ...currentTask, status };
    setTasks((current) => current.map((task) => (task.id === taskId ? optimistic : task)));

    void (async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: taskId, status, order: currentTask.order }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to update task status");
        }
        setTasks((current) => current.map((task) => (task.id === taskId ? payload.task : task)));
        toast.success(`Moved to ${taskStatusLabels[status]}`);
      } catch (error) {
        setTasks((current) => current.map((task) => (task.id === taskId ? currentTask : task)));
        toast.error(error instanceof Error ? error.message : "Unable to update task");
      }
    })();
  }

  const createDefaults: TaskFormValues = {
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    order: 0,
    dueDate: "",
    labels: "",
    projectId: data.projects[0]?.id ?? "",
    assigneeId: "",
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.09),_transparent_25%),linear-gradient(180deg,#050816_0%,#070b1c_100%)] text-white">
      <div className="mx-auto flex max-w-[1680px] gap-6 px-4 py-4 lg:px-6">
        <aside className="glass sticky top-4 hidden h-[calc(100vh-2rem)] w-72 shrink-0 flex-col rounded-[1.75rem] p-4 lg:flex">
          <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-white">{data.user.name}</p>
                <p className="text-sm text-white/55">{data.user.role}</p>
              </div>
            </div>
          </div>

          <nav className="mt-4 grid gap-2 text-sm text-white/70">
            {[ [LayoutDashboard, "Dashboard"], [Layers3, "Projects"], [Users, "Team"], [ListFilter, "Kanban"], [Settings2, "Settings"] ].map(([Icon, label]) => (
              <button key={label as string} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-white/8 hover:text-white">
                <Icon className="h-4 w-4" />
                {label as string}
              </button>
            ))}

            {data.user.role === "ADMIN" ? (
              <a href="/admin/users" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-white/8 hover:text-white">
                <Users className="h-4 w-4" />
                Admin
              </a>
            ) : null}
          </nav>

          <div className="mt-auto rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Notifications</p>
            <div className="mt-3 grid gap-3">
              {data.notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                  <p className="text-sm font-medium text-white">{notification.title}</p>
                  <p className="mt-1 text-xs text-white/55">{notification.message}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex min-h-screen min-w-0 flex-1 flex-col gap-6 pb-4">
          <header className="glass flex flex-col gap-4 rounded-[1.75rem] p-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Workspace</p>
              <h1 className="text-2xl font-semibold text-white">Team Task Manager</h1>
              <p className="text-sm text-white/55">Overdue detection, productivity trends, and drag-and-drop task flow.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                <Link href="/">Back home</Link>
              </Button>
              <Button variant="ghost" className="rounded-full text-white hover:bg-white/10" onClick={() => void handleLogout()}>
                Log out
              </Button>

              <div className="relative min-w-[220px] flex-1 lg:min-w-[320px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks, people, projects" className="pl-10" />
              </div>

              <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="all" className="bg-slate-950">All projects</option>
                {data.projects.map((project) => (
                  <option key={project.id} value={project.id} className="bg-slate-950">
                    {project.key} · {project.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <Dialog open={creatingTaskOpen} onOpenChange={setCreatingTaskOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full">
                      <Plus className="h-4 w-4" />
                      New task
                    </Button>
                  </DialogTrigger>
                  <TaskDialog defaultValues={createDefaults} projects={projects} assignees={uniqueAssignees} onSave={async (values) => {
                    await saveTask(values);
                    setCreatingTaskOpen(false);
                  }} />
                </Dialog>

                {isAdmin ? (
                  <Dialog open={creatingProjectOpen} onOpenChange={setCreatingProjectOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-full">
                        <Plus className="h-4 w-4" />
                        New project
                      </Button>
                    </DialogTrigger>
                    <ProjectDialog teams={data.teams} onSave={async (values) => {
                      await saveProject(values);
                      setCreatingProjectOpen(false);
                    }} />
                  </Dialog>
                ) : null}
              </div>
            </div>
          </header>

          {isAdmin ? (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                  ["Projects", data.stats.totalProjects, "border-cyan-400/20 bg-cyan-400/10"],
                  ["Tasks", data.stats.totalTasks, "border-white/10 bg-white/5"],
                  ["Open", data.stats.openTasks, "border-sky-400/20 bg-sky-400/10"],
                  ["Overdue", data.stats.overdueTasks, "border-rose-400/20 bg-rose-400/10"],
                  ["Productivity", `${data.stats.productivity}%`, "border-emerald-400/20 bg-emerald-400/10"],
                ].map(([label, value, tone]) => (
                  <Card key={label as string} className={cn("border-white/10 p-5", tone as string)}>
                    <p className="text-sm text-white/65">{label as string}</p>
                    <p className="mt-4 text-3xl font-semibold text-white">{value as string}</p>
                  </Card>
                ))}
              </section>

              {/* Admin panel: show user/task breakdown */}
              {data.user.role === "ADMIN" && (data as any).adminStats ? (
                <section className="mt-4">
                  <Card className="p-5">
                    <CardHeader className="p-0 pb-4">
                      <CardTitle>Admin overview</CardTitle>
                      <CardDescription>Users and task activity across the workspace.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-white/70">Total users</p>
                          <p className="text-lg font-semibold text-white">{(data as any).adminStats.totalUsers}</p>
                        </div>

                        <div className="mt-4 grid gap-2">
                          {(data as any).adminStats.users.slice(0, 8).map((u: any) => (
                            <div key={u.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                              <div>
                                <p className="font-medium text-white">{u.name}</p>
                                <p className="text-xs text-white/55">{u.totalTasks} tasks — {u.completedTasks} done</p>
                              </div>
                              <div className="text-sm text-white/60">{u.openTasks} open</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              ) : null}

              <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Card className="p-5">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle>Productivity trend</CardTitle>
                    <CardDescription>Weekly completions versus overdue work.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[280px] p-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.weeklyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.45)" />
                        <YAxis stroke="rgba(255,255,255,0.45)" allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "rgba(9,13,31,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, color: "#fff" }} />
                        <Bar dataKey="completed" fill="#22d3ee" radius={[10, 10, 0, 0]} />
                        <Bar dataKey="overdue" fill="#fb7185" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="p-5">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle>Activity feed</CardTitle>
                    <CardDescription>Recent system events from the workspace.</CardDescription>
                  </CardHeader>
                  <div className="grid gap-3">
                    {data.activities.map((activity) => (
                      <div key={activity.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">{activity.message}</p>
                            <p className="mt-1 text-xs text-white/50">{activity.actor?.name ?? "System"}</p>
                          </div>
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
                <Card className="p-5">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle>Kanban board</CardTitle>
                    <CardDescription>Drag cards between stages to update status in real time.</CardDescription>
                  </CardHeader>

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={({ active, over }) => {
                    if (!over || over.id === active.id) return;
                    void moveTask(String(active.id), over.id as TaskStatus);
                  }}>
                    <div className="grid gap-4 lg:grid-cols-4">
                      {taskStatuses.map((status) => (
                        <StatusColumn key={status} status={status} title={taskStatusLabels[status]} count={tasksByStatus[status].length}>
                          {tasksByStatus[status].map((task) => (
                            <TaskCard key={task.id} task={task} onEdit={() => setEditingTask(task)} onDelete={() => void deleteTask(task.id)} />
                          ))}
                        </StatusColumn>
                      ))}
                    </div>
                  </DndContext>
                </Card>

                <div className="grid gap-6">
                  <Card className="p-5">
                    <CardHeader className="p-0 pb-4">
                      <CardTitle>Projects</CardTitle>
                      <CardDescription>Track delivery progress and deadline risk.</CardDescription>
                    </CardHeader>
                    <div className="grid gap-3">
                      {data.projects.map((project) => (
                        <div key={project.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-white">{project.name}</p>
                              <p className="mt-1 text-sm text-white/55">{project.key}</p>
                            </div>
                            <Badge className="border-none" variant={project.status === "ACTIVE" ? "default" : "secondary"}>
                              {project.status}
                            </Badge>
                          </div>
                          <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                            <span>{project.taskCount} tasks</span>
                            <span>{project.completedCount} done</span>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full" style={{ width: `${project.taskCount === 0 ? 0 : Math.round((project.completedCount / project.taskCount) * 100)}%`, background: project.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-5">
                    <CardHeader className="p-0 pb-4">
                      <CardTitle>Notifications</CardTitle>
                      <CardDescription>Unread activity and reminders.</CardDescription>
                    </CardHeader>
                    <div className="grid gap-3">
                      {data.notifications.map((notification) => (
                        <div key={notification.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <Bell className="h-4 w-4 text-cyan-300" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white">{notification.title}</p>
                            <p className="truncate text-sm text-white/55">{notification.message}</p>
                          </div>
                          {!notification.read ? <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" /> : null}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="mt-4">
                <Card className="p-5">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle>Your workspace</CardTitle>
                    <CardDescription>Quick view of your assigned tasks and projects.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      <p className="text-sm text-white/70">Assigned tasks</p>
                      <div className="mt-2 grid gap-2">
                        {tasks.slice(0, 6).map((t) => (
                          <div key={t.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                            <div>
                              <p className="font-medium text-white">{t.title}</p>
                              <p className="text-xs text-white/55">{t.projectName} — {t.priority}</p>
                            </div>
                            <div className="text-sm text-white/60">{t.status}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
                <Card className="p-5">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle>Kanban board</CardTitle>
                    <CardDescription>Your tasks in a Kanban view.</CardDescription>
                  </CardHeader>

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={({ active, over }) => {
                    if (!over || over.id === active.id) return;
                    void moveTask(String(active.id), over.id as TaskStatus);
                  }}>
                    <div className="grid gap-4 lg:grid-cols-4">
                      {taskStatuses.map((status) => (
                        <StatusColumn key={status} status={status} title={taskStatusLabels[status]} count={tasksByStatus[status].length}>
                          {tasksByStatus[status].map((task) => (
                            <TaskCard key={task.id} task={task} onEdit={() => setEditingTask(task)} onDelete={() => void deleteTask(task.id)} />
                          ))}
                        </StatusColumn>
                      ))}
                    </div>
                  </DndContext>
                </Card>

                <div className="grid gap-6">
                  <Card className="p-5">
                    <CardHeader className="p-0 pb-4">
                      <CardTitle>Projects</CardTitle>
                      <CardDescription>Projects you're part of.</CardDescription>
                    </CardHeader>
                    <div className="grid gap-3">
                      {data.projects.map((project) => (
                        <div key={project.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-white">{project.name}</p>
                              <p className="mt-1 text-sm text-white/55">{project.key}</p>
                            </div>
                            <Badge className="border-none" variant={project.status === "ACTIVE" ? "default" : "secondary"}>
                              {project.status}
                            </Badge>
                          </div>
                          <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                            <span>{project.taskCount} tasks</span>
                            <span>{project.completedCount} done</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-5">
                    <CardHeader className="p-0 pb-4">
                      <CardTitle>Notifications</CardTitle>
                      <CardDescription>Unread activity and reminders.</CardDescription>
                    </CardHeader>
                    <div className="grid gap-3">
                      {data.notifications.map((notification) => (
                        <div key={notification.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <Bell className="h-4 w-4 text-cyan-300" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white">{notification.title}</p>
                            <p className="truncate text-sm text-white/55">{notification.message}</p>
                          </div>
                          {!notification.read ? <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" /> : null}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      <Dialog open={Boolean(editingTask)} onOpenChange={(open) => !open && setEditingTask(null)}>
        {editingTask ? (
          <TaskDialog defaultValues={toFormValues(editingTask)} taskId={editingTask.id} projects={data.projects} assignees={uniqueAssignees} onSave={async (values, taskId) => {
            await saveTask(values, taskId);
            setEditingTask(null);
          }} />
        ) : null}
      </Dialog>
    </div>
  );

  function toFormValues(task: TaskSummary): TaskFormValues {
    return {
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      order: task.order,
      dueDate: task.dueDate ? toDateTimeLocal(task.dueDate) : "",
      labels: task.labels.join(", "),
      projectId: task.projectId,
      assigneeId: task.assignee?.id ?? "",
    };
  }
}

function StatusColumn({ status, title, count, children }: { status: TaskStatus; title: string; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className={cn("rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-3 transition", isOver && "ring-2 ring-cyan-400")}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-white">{title}</p>
          <p className="text-xs text-white/45">{count} tasks</p>
        </div>
        <Badge variant="outline">{status}</Badge>
      </div>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete }: { task: TaskSummary; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("cursor-grab rounded-[1.3rem] border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/20 transition", isDragging && "cursor-grabbing opacity-70")}
      {...attributes}
      {...listeners}
    >
      <div className="space-y-2">
        <Badge className="border-none" variant={task.overdue ? "destructive" : "default"}>
          {task.priority}
        </Badge>
        <p className="font-medium text-white">{task.title}</p>
        <p className="line-clamp-3 text-sm text-white/55">{task.description}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-white/55">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{task.assignee?.name?.slice(0, 2).toUpperCase() ?? "TM"}</AvatarFallback>
          </Avatar>
          <span>{task.assignee?.name ?? "Unassigned"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 px-3 text-xs">
            Edit
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-rose-200 hover:bg-rose-400/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function TaskDialog({
  defaultValues,
  taskId,
  projects,
  assignees,
  onSave,
}: {
  defaultValues: TaskFormValues;
  taskId?: string;
  projects: DashboardData["projects"];
  assignees: NonNullable<TaskSummary["assignee"]>[];
  onSave: (values: TaskSubmitValues, taskId?: string) => Promise<void>;
}) {
  const { register, handleSubmit, formState } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema) as never,
    defaultValues,
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{taskId ? "Edit task" : "Create task"}</DialogTitle>
        <DialogDescription>Validate, assign, and track work from one place.</DialogDescription>
      </DialogHeader>

      <form className="grid gap-4" onSubmit={handleSubmit(async (values) => {
        const submitValues: TaskSubmitValues = {
          ...values,
          labels: String(values.labels || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        };

        await onSave(submitValues, taskId);
      })}>
        <Field label="Title" error={formState.errors.title?.message as string | undefined}>
          <Input {...register("title")} placeholder="Launch checklist" />
        </Field>

        <Field label="Description" error={formState.errors.description?.message as string | undefined}>
          <Textarea {...register("description")} placeholder="Describe the task outcome" />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Project" error={formState.errors.projectId?.message as string | undefined}>
            <select className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none" {...register("projectId")}>
              {projects.map((project) => (
                <option key={project.id} value={project.id} className="bg-slate-950">{project.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Assignee" error={formState.errors.assigneeId?.message as string | undefined}>
            <select className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none" {...register("assigneeId")}>
              <option value="" className="bg-slate-950">Unassigned</option>
              {assignees.map((member) => (
                <option key={member.id} value={member.id} className="bg-slate-950">{member.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Status">
            <select className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none" {...register("status")}>
              {taskStatuses.map((status) => <option key={status} value={status} className="bg-slate-950">{taskStatusLabels[status]}</option>)}
            </select>
          </Field>

          <Field label="Priority">
            <select className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none" {...register("priority")}>
              {priorities.map((priority) => <option key={priority} value={priority} className="bg-slate-950">{priorityLabels[priority]}</option>)}
            </select>
          </Field>

          <Field label="Due date">
            <Input type="datetime-local" {...register("dueDate")} />
          </Field>
        </div>

        <Field label="Labels">
          <Input {...register("labels" as never)} placeholder="billing, launch, design" />
        </Field>

        <DialogFooter className="mt-2">
          <Button type="submit">Save task</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className={cn(error && "text-rose-200")}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-rose-200">{error}</p> : null}
    </div>
  );
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
