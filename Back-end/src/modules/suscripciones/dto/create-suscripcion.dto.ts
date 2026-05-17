import { IsString, IsEmail, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateSuscripcionDto {
  @IsString()
  @IsNotEmpty()
  cardTokenId: string;

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
