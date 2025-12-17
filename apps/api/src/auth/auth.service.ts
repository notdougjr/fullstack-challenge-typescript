import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashService } from 'src/common/hash/hash.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { DataSource } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const existingUser = await this.userService.findOneBy({
        email: registerDto.email,
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      const hashedPassword = await this.hashService.hash(registerDto.password);

      const newUser = this.dataSource.manager.create(User, {
        email: registerDto.email,
        password: hashedPassword,
        username: registerDto.username,
      });

      const savedUser = await this.dataSource.manager.save(newUser);

      const jwtPayload: JwtPayload = {
        sub: savedUser.id,
        email: savedUser.email,
      };

      const accessToken = await this.jwtService.signAsync(jwtPayload);

      return {
        user: savedUser,
        accessToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`User not created: ${error}`);
    }
  }

  async login(loginDto: LoginDto) {
    const error = new UnauthorizedException('Email or Password incorrect');

    const user = await this.userService.findOneByOrFail({
      email: loginDto.email,
    });

    const isPasswordCorrect = await this.hashService.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw error;
    }

    const jwtPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload);

    return {
      user,
      accessToken,
    };
  }

  async logout() {
    return { message: 'Logged out successfully' };
  }
}
