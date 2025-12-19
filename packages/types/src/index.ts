export enum TaskStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

export enum TaskType {
  TASK = "TASK",
  SUBTASK = "SUBTASK",
}

export interface User {
  id: string;
  username?: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  type: TaskType;
  createdBy: User;
  assignedTo?: User;
  parentId?: string;
  startDate?: Date;
  dueDate?: Date;
  createdAt: Date;
}

export type CreateTaskInput = Omit<
  Task,
  "id" | "createdAt" | "createdBy" | "assignedTo"
> & {
  createdBy?: string;
  assignedTo?: string;
};

export type UpdateTaskInput = Partial<
  Omit<Task, "id" | "createdAt" | "createdBy" | "assignedTo">
> & {
  id: string;
  assignedTo?: string;
};
