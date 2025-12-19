import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
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

    await this.validateUserExists(createdById);

    if (createTaskDto.assignedTo) {
      await this.validateUserExists(createTaskDto.assignedTo);
    }

    if (createTaskDto.parentId) {
      await this.taskRepository.findOneByOrFail({ id: createTaskDto.parentId });
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      createdBy: createdById,
    });

    return await this.taskRepository.save(task);
  }

  async findAll(): Promise<Task[]> {
    return await this.taskRepository.find();
  }

  async findOne(id: string): Promise<Task | null> {
    return await this.taskRepository.findOne({ where: { id } });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    const task = await this.findOne(id);
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    if (updateTaskDto.assignedTo) {
      await this.validateUserExists(updateTaskDto.assignedTo);
    }

    if (updateTaskDto.parentId) {
      await this.taskRepository.findOneByOrFail({ id: updateTaskDto.parentId });
    }

    await this.taskRepository.update(id, updateTaskDto);
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
