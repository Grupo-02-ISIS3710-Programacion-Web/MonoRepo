// src/modules/productos/dto/find-productos-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindProductosQueryDto {
  @ApiPropertyOptional({
    description: 'Texto libre (nombre, marca, ingrediente)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Código de categoría, ej: HIDRATACION' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Marcas separadas por coma, ej: CeraVe,Vichy',
  })
  @IsOptional()
  @IsString()
  brands?: string;

  @ApiPropertyOptional({
    description: 'Tipos de piel separados por coma, ej: SECA,SENSIBLE',
  })
  @IsOptional()
  @IsString()
  skinTypes?: string;

  @ApiPropertyOptional({
    description: 'Ingredientes a excluir, separados por coma',
  })
  @IsOptional()
  @IsString()
  excludeIngredients?: string;
}
