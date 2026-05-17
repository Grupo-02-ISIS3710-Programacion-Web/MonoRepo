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

import { SkinType } from '../../enums/enums';

export class RegisterDto {
  
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsDateString()
  fechaNacimiento: Date;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  contrasenia: string;

  @IsString()
  @MinLength(8)
  confirmarContrasenia: string;

  

  @IsEnum(SkinType)
  tipoPiel: SkinType;

  @IsString()
  comoEnteroDeNosotros: string;

  @IsBoolean()
  probadoSkinCare: boolean;

  // NUEVOS

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}