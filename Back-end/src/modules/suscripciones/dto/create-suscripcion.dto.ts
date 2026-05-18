import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateSuscripcionDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  acceptanceToken: string;

  @IsString()
  @IsNotEmpty()
  acceptPersonalAuth: string;

  @IsEmail()
  @IsNotEmpty()
  payerEmail: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsOptional()
  transactionAmount?: number;

  @IsString()
  @IsOptional()
  currencyId?: string;
}
