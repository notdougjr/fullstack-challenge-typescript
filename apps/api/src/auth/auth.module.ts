import { InternalServerErrorException, Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CommonModule } from 'src/common/common.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UserModule,
    CommonModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => {
        const secret = process.env.JWT_SECRET || 'dev-jwt-secret';

        if (!secret) {
          throw new InternalServerErrorException('JWT_SECRET not found .env');
        }

        const expiration = process.env.JWT_EXPIRATION || '1d';
        const expiresIn = expiration.match(/^\d+$/)
          ? Number(expiration)
          : expiration;

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        } as JwtModuleOptions;
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
