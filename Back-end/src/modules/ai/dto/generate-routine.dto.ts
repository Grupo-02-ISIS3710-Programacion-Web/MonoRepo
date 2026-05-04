import { ApiProperty } from '@nestjs/swagger';

export class GenerateRoutineDto {
  @ApiProperty({
    description: 'ID del usuario que solicita la rutina',
    example: 'u1'
  })
  userId: string;

  @ApiProperty({
    description: 'Tipo de piel del usuario',
    example: 'mixta',
    enum: ['normal', 'seca', 'grasa', 'mixta', 'sensible', 'opaca', 'texturizada', 'acneica']
  })
  skinType: string;

  @ApiProperty({
    description: 'Tipo de rutina: am (mañana) o pm (noche)',
    example: 'am',
    enum: ['am', 'pm']
  })
  type: string;

  @ApiProperty({
    description: 'Preocupaciones o áreas de enfoque (ej. hidratación, acné, manchas)',
    required: false,
    example: ['hidratación', 'control de sebo'],
    type: [String]
  })
  concerns?: string[];

  @ApiProperty({
    description: 'Número de pasos deseados (opcional, por defecto 3-5)',
    required: false,
    example: 4
  })
  stepCount?: number;

  @ApiProperty({
    description: 'Productos preferidos o que el usuario ya tenga (opcional)',
    required: false,
    example: ['5', '12'],
    type: [String]
  })
  preferredProductIds?: string[];
}
