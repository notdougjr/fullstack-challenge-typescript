import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly userService: UserService,
  ) {}

  private async validateUserExists(userId: string): Promise<void> {
    await this.userService.findOneByOrFail({ id: userId });
  }

  async create(
    createTaskDto: CreateTaskDto,
    authenticatedUserId: string,
  ): Promise<Task> {
    const createdById = createTaskDto.createdBy ?? authenticatedUserId;

    const createdByUser = await this.userService.findOneByOrFail({
      id: createdById,
    });

    let assignedToUser: User | undefined = undefined;
    if (createTaskDto.assignedTo) {
      assignedToUser = await this.userService.findOneByOrFail({
        id: createTaskDto.assignedTo,
      });
    }

    if (createTaskDto.parentId) {
      await this.taskRepository.findOneByOrFail({ id: createTaskDto.parentId });
    }

    const task = this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status,
      type: createTaskDto.type,
      createdBy: createdByUser,
      assignedTo: assignedToUser,
      parentId: createTaskDto.parentId,
      startDate: createTaskDto.startDate,
      dueDate: createTaskDto.dueDate,
    });

    return await this.taskRepository.save(task);
  }

  async findAll(): Promise<Task[]> {
    return await this.taskRepository.find({
      relations: ['assignedTo', 'createdBy'],
    });
  }

  async findOne(id: string): Promise<Task | null> {
    return await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy'],
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    const task = await this.findOne(id);
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    task.title = updateTaskDto.title ?? task.title;
    task.description = updateTaskDto.description ?? task.description;
    task.status = updateTaskDto.status ?? task.status;
    task.type = updateTaskDto.type ?? task.type;
    task.parentId = updateTaskDto.parentId ?? task.parentId;
    task.startDate = updateTaskDto.startDate
      ? new Date(updateTaskDto.startDate)
      : task.startDate;
    task.dueDate = updateTaskDto.dueDate
      ? new Date(updateTaskDto.dueDate)
      : task.dueDate;
    task.assignedTo = updateTaskDto.assignedTo
      ? await this.userService.findOneByOrFail({ id: updateTaskDto.assignedTo })
      : task.assignedTo;

    await this.taskRepository.save(task);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    await this.taskRepository.delete(id);
  }
}
