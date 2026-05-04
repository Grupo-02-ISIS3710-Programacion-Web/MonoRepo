import { ApiProperty } from '@nestjs/swagger';

export class SuggestProductsDto {
  @ApiProperty({
    description: 'Tipo de piel del usuario',
    example: 'mixta',
    enum: ['normal', 'seca', 'grasa', 'mixta', 'sensible', 'opaca', 'texturizada', 'acneica']
  })
  skinType: string;

  @ApiProperty({
    description: 'Paso de la rutina para el cual se sugieren productos',
    example: 'Limpieza',
  })
  stepName: string;

  @ApiProperty({
    description: 'Categoría de producto deseada (opcional)',
    required: false,
    example: 'limpieza',
    enum: ['hidratacion', 'limpieza', 'exfoliacion', 'anti-edad', 'reparacion', 'antioxidante']
  })
  category?: string;

  @ApiProperty({
    description: 'Preocupaciones específicas',
    required: false,
    example: ['sensibilidad'],
    type: [String]
  })
  concerns?: string[];
}
