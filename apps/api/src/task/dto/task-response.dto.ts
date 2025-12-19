import { Task, TaskStatus, TaskType } from '../entities/task.entity';
import { User } from 'src/user/entities/user.entity';

export class TaskResponseDto {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly type: TaskType;
  readonly createdBy: User;
  readonly assignedTo?: User;
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
    this.description = task.description ?? undefined;
    this.assignedTo = task.assignedTo ?? undefined;
    this.parentId = task.parentId ?? undefined;
    this.startDate = task.startDate ?? undefined;
    this.dueDate = task.dueDate ?? undefined;
  }
}
