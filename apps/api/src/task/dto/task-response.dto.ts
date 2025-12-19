import { Task, TaskStatus, TaskType } from '../entities/task.entity';

export class TaskResponseDto {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly type: TaskType;
  readonly createdBy: string;
  readonly assignedTo?: string;
  readonly parentId?: string;
  readonly startDate?: Date;
  readonly dueDate?: Date;
  readonly createdAt: Date;

  constructor(task: Task) {
    this.id = task.id;
    this.title = task.title;
    this.status = task.status;
    this.type = task.type;
    this.createdBy = task.createdBy;
    this.createdAt = task.createdAt;
    if (task.description) {
      this.description = task.description;
    }
    if (task.assignedTo) {
      this.assignedTo = task.assignedTo;
    }
    if (task.parentId) {
      this.parentId = task.parentId;
    }
    if (task.startDate) {
      this.startDate = task.startDate;
    }
    if (task.dueDate) {
      this.dueDate = task.dueDate;
    }
  }
}
