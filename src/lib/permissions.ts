import type { AuthUser } from "./contracts";

export function isAdmin(user: AuthUser | null | undefined) {
  return user?.role === "ADMIN";
}

export function canManageWorkspace(user: AuthUser | null | undefined) {
  return isAdmin(user);
}

export function canEditTask(user: AuthUser | null | undefined, assigneeId?: string | null) {
  if (!user) {
    return false;
  }

  return user.role === "ADMIN" || user.id === assigneeId;
}
