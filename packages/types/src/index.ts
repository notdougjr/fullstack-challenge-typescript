export enum TaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export enum TaskType {
  TASK = 'TASK',
  SUBTASK = 'SUBTASK',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  type: TaskType;
  createdBy: string;
  assignedTo?: string;
  parentId?: string;
  startDate?: Date;
  dueDate?: Date;
  createdAt: Date;
}

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt'> & {
  createdBy?: string;
};

export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt'>> & {
  id: string;
};
