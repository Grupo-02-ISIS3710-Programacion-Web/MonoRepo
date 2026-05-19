import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetInUserDto {
  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'usuario@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'miPassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
