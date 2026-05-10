import {
  IsString,IsNotEmpty,IsEmail,
  IsBoolean,MinLength,IsEnum,
  IsDateString,
} from 'class-validator';

import { SkinType } from '../../../enums/enums';

export class RegisterDtoUser {

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsDateString()
  birthDate: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(SkinType)
  skinType: SkinType;

  @IsString()
  @IsNotEmpty()
  discoverySource: string;

  @IsBoolean()
  usedProductsBefore: boolean;
}