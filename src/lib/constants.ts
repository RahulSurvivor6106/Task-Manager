export const roles = ["ADMIN", "MEMBER"] as const;
export const taskStatuses = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"] as const;
export const projectStatuses = ["ACTIVE", "ARCHIVED"] as const;
export const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const taskStatusLabels: Record<(typeof taskStatuses)[number], string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  DONE: "Done",
};

export const priorityLabels: Record<(typeof priorities)[number], string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};
