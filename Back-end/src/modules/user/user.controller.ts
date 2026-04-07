import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto, LoginDto, AuthResponseDto } from '../../common/dtos/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAllUsers(): UserDto[] {
    return this.userService.getAll();
  }

  @Get(':id')
  getUserById(@Param('id') id: string): UserDto | undefined {
    return this.userService.getById(id);
  }

  @Post('authenticate')
  authenticate(@Body() loginDto: LoginDto): AuthResponseDto {
    return this.userService.authenticate(
      loginDto.identifier,
      loginDto.password,
    );
  }
}
