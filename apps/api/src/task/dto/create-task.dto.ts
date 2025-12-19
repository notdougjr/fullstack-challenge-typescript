import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { TaskStatus, TaskType } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @IsUUID()
  @IsNotEmpty()
  createdBy: string;

  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
