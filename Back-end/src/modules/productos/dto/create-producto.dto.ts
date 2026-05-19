import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProductoDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'Toleriane Double Repair Face Moisturizer' })
  name: string;

  @ApiProperty({ description: 'Marca del producto', example: 'La Roche-Posay' })
  brand: string;

  @ApiProperty({ description: 'Tipo(s) de piel para los que es apto', example: ['normal', 'seca'] })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map(String)
      : typeof value === 'string'
        ? value
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : [],
  )
  skin_type: string[];

  @ApiProperty({ description: 'Descripción del producto', example: 'Crema hidratante para fortalecer la barrera cutánea.' })
  description: string;

  @ApiProperty({ description: 'Tipo de producto', example: 'cream' })
  product_type: string;

  @ApiProperty({ description: 'Categoría principal', example: 'hidratacion' })
  primary_category: string;

  @ApiPropertyOptional({ description: 'Categorías adicionales', example: ['reparacion', 'limpieza'] })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map(String)
      : typeof value === 'string'
        ? value
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : [],
  )
  additional_categories?: string[];

  @ApiProperty({ description: 'Lista de ingredientes', example: ['ceramida-3', 'niacinamida', 'glicerina'] })
  ingredients: string[];
}
