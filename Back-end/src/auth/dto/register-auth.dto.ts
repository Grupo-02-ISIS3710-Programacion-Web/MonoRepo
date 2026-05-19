import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { SkinType } from '../../enums/enums';

export class RegisterDto {
  @ApiProperty({ description: 'Nombre completo del usuario', example: 'Juan Pérez', minLength: 3 })
  @IsString()
  @MinLength(3)
  nombre: string;

  @ApiProperty({ description: 'Fecha de nacimiento', example: '1998-05-15' })
  @IsDateString()
  fechaNacimiento: Date;

  @ApiProperty({ description: 'Correo electrónico', example: 'usuario@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contraseña', example: 'miPassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  contrasenia: string;

  @ApiProperty({ description: 'Confirmación de la contraseña', example: 'miPassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  confirmarContrasenia: string;

  @ApiProperty({ description: 'Tipo de piel', enum: SkinType, example: 'mixta' })
  @IsEnum(SkinType)
  tipoPiel: SkinType;

  @ApiProperty({ description: 'Cómo se enteró de nosotros', example: 'Instagram' })
  @IsString()
  comoEnteroDeNosotros: string;

  @ApiProperty({ description: 'Si ha probado productos de skincare antes', example: true })
  @IsBoolean()
  probadoSkinCare: boolean;

  @ApiPropertyOptional({ description: 'Ciudad de residencia', example: 'Bogotá' })
  @IsOptional()
  @IsString()
  ciudad?: string;

  @ApiPropertyOptional({ description: 'Biografía corta', maxLength: 300, example: 'Amante del skincare natural' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;

  @ApiPropertyOptional({ description: 'URL del avatar', example: 'https://res.cloudinary.com/...' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
