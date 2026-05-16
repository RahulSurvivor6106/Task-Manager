import { z } from "zod";
import { priorities, projectStatuses, roles, taskStatuses } from "./constants";

export const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(roles).default("MEMBER"),
  title: z.string().max(80).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const teamSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(255).optional(),
  memberIds: z.array(z.string()).optional(),
});

export const projectSchema = z.object({
  name: z.string().min(2).max(120),
  key: z.string().min(2).max(20).regex(/^[A-Z0-9-]+$/),
  description: z.string().max(500).optional(),
  status: z.enum(projectStatuses).default("ACTIVE"),
  color: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/).default("#22d3ee"),
  dueDate: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  teamId: z.string().min(1),
});

const labelsSchema = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}, z.array(z.string().min(1).max(24)));

export const taskSchema = z.object({
  title: z.string().min(2).max(140),
  description: z.string().max(1000).optional(),
  status: z.enum(taskStatuses).default("TODO"),
  priority: z.enum(priorities).default("MEDIUM"),
  order: z.number().int().nonnegative().default(0),
  dueDate: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  labels: labelsSchema.default([]),
  projectId: z.string().min(1),
  assigneeId: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
});

export const taskPatchSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2).max(140).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(taskStatuses).optional(),
  priority: z.enum(priorities).optional(),
  order: z.number().int().nonnegative().optional(),
  dueDate: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()).optional(),
  labels: labelsSchema.optional(),
  projectId: z.string().min(1).optional(),
  assigneeId: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()).optional(),
});

export const taskQuerySchema = z.object({
  projectId: z.string().optional(),
  status: z.enum(taskStatuses).optional(),
  assigneeId: z.string().optional(),
  search: z.string().optional(),
});

export const analyticsQuerySchema = z.object({
  projectId: z.string().optional(),
});
