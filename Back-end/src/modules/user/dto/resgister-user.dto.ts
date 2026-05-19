import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsBoolean,
  MinLength,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { SkinType } from '../../../enums/enums';

export class RegisterDto {
  @ApiProperty({ description: 'Nombre completo', example: 'Juan Pérez', minLength: 3 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({ description: 'Fecha de nacimiento', example: '1998-05-15' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ description: 'Correo electrónico', example: 'usuario@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contraseña', example: 'miPassword123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Tipo de piel', enum: SkinType, example: 'mixta' })
  @IsString()
  @IsNotEmpty()
  @IsEnum(SkinType)
  skinType: SkinType;

  @ApiProperty({ description: 'Cómo se enteró de nosotros', example: 'Instagram' })
  @IsString()
  @IsNotEmpty()
  discoverySource: string;

  @ApiProperty({ description: 'Si ha usado productos de cuidado facial antes', example: true })
  @IsBoolean()
  usedProductsBefore: boolean;
}
