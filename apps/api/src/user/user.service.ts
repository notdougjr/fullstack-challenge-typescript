import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HashService } from 'src/common/hash/hash.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
  ) {}

  async findOneByOrFail(userData: Partial<User>) {
    const user = await this.userRepository.findOne({
      where: userData,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneBy(userData: Partial<User>) {
    return this.userRepository.findOne({
      where: userData,
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.hashService.hash(createUserDto.password);

    const userData = {
      email: createUserDto.email,
      username: createUserDto.username,
      password: hashedPassword,
    };

    const exists = await this.userRepository.exists({
      where: { email: createUserDto.email },
    });
    if (exists) {
      throw new ConflictException('Email already exists');
    }
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: string) {
    return this.findOneByOrFail({ id });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!updateUserDto.username) {
      throw new BadRequestException('Data not sent');
    }

    const user = await this.findOneByOrFail({ id });

    user.username = updateUserDto.username ?? user.username;

    const updated = await this.userRepository.save(user);
    return updated;
  }

  async remove(id: string) {
    const user = await this.findOneByOrFail({ id });
    await this.userRepository.delete(id);

    return user;
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<User> {
    const user = await this.findOneByOrFail({ id: userId });
    user.refreshToken = refreshToken ?? undefined;
    return this.userRepository.save(user);
  }
}
