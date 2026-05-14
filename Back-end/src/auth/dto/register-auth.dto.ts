import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsBoolean,
  MinLength,
  IsDateString,
} from 'class-validator';

export class RegisterDtoUser {

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nombre: string;

  @IsDateString()
  fechaNacimiento: string;

  @IsString()
  @IsNotEmpty()
  tipoPiel: string;

  @IsBoolean()
  probadoSkinCare: boolean;

  @IsString()
  @IsNotEmpty()
  comoEnteroDeNosotros: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  contrasenia: string;

  @IsString()
  @IsNotEmpty()
  confirmarContrasenia: string;
}