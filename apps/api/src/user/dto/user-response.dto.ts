import { User } from '../entities/user.entity';

export class UserResponseDto {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.createdAt = user.createdAt;
    if (user.username) {
      this.username = user.username;
    }
  }
}
