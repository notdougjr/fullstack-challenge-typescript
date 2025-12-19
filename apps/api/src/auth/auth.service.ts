import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashService } from 'src/common/hash/hash.service';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const savedUser = await this.userService.create(registerDto);

      const jwtPayload: JwtPayload = {
        sub: savedUser.id,
        email: savedUser.email,
      };

      const accessToken = await this.jwtService.signAsync(jwtPayload);

      const refreshTokenExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';

      const refreshToken = await this.jwtService.signAsync(jwtPayload, {
        expiresIn: refreshTokenExpiration,
      } as any);

      await this.userService.updateRefreshToken(savedUser.id, refreshToken);

      return {
        user: savedUser,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new BadRequestException('User with this email already exists');
      }
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

    const refreshTokenExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';

    const refreshToken = await this.jwtService.signAsync(jwtPayload, {
      expiresIn: refreshTokenExpiration,
    } as any);

    await this.userService.updateRefreshToken(user.id, refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.userService.updateRefreshToken(userId, null);

    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userService.findOneByOrFail({ id: payload.sub });

    if (!user.refreshToken || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    const newJwtPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(newJwtPayload);

    return {
      accessToken,
    };
  }
}
