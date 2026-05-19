import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSuscripcionDto {
  @ApiProperty({ description: 'Token de la tarjeta generado por Wompi', example: 'tok_123abc' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'Token de aceptación de términos de Wompi', example: 'acc_456def' })
  @IsString()
  @IsNotEmpty()
  acceptanceToken: string;

  @ApiProperty({ description: 'Token de autorización de datos personales', example: 'auth_789ghi' })
  @IsString()
  @IsNotEmpty()
  acceptPersonalAuth: string;

  @ApiProperty({ description: 'Correo del pagador', example: 'usuario@email.com' })
  @IsEmail()
  @IsNotEmpty()
  payerEmail: string;

  @ApiProperty({ description: 'ID del usuario', example: 'u1' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'Monto de la transacción', example: 29900 })
  @IsNumber()
  @IsOptional()
  transactionAmount?: number;

  @ApiPropertyOptional({ description: 'ID de la moneda', example: 'COP' })
  @IsString()
  @IsOptional()
  currencyId?: string;
}
