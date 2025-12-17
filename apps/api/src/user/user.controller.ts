import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { type AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return users.map((u) => new UserResponseDto(u));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async findOne(@Req() req: AuthenticatedRequest) {
    const user = await this.userService.findOne(req.user.id);
    return new UserResponseDto(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  async update(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.update(req.user.id, updateUserDto);
    return new UserResponseDto(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('me')
  async remove(@Req() req: AuthenticatedRequest) {
    const user = await this.userService.remove(req.user.id);
    return new UserResponseDto(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async removeById(@Param('id') id: string) {
    const user = await this.userService.remove(id);
    return new UserResponseDto(user);
  }
}
