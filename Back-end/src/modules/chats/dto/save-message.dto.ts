import { ApiProperty } from '@nestjs/swagger';

export class SaveMessageDto {
  @ApiProperty({
    description: 'Rol del mensaje',
    enum: ['user', 'assistant'],
    example: 'user',
  })
  role: string;

  @ApiProperty({
    description: 'Contenido del mensaje',
    example: '¿Qué rutina debo usar para piel grasa?',
  })
  content: string;

  @ApiProperty({
    description: 'Productos recomendados (solo para mensajes del asistente)',
    required: false,
    example: [
      {
        productId: '69f8832d56dcaa1b4eb44a30',
        reason: 'Controla el exceso de grasa sin resecar',
        otherAlternatives: [
          { id: '69f8832d56dcaa1b4eb44a27', reason: 'Alternativa suave' },
        ],
      },
    ],
  })
  recommendedProducts?: {
    productId: string;
    reason: string;
    otherAlternatives?: { id: string; reason: string }[];
  }[];

  @ApiProperty({
    description: 'Sugerencia de actualización del borrador',
    required: false,
  })
  draftUpdate?: {
    steps?: { productId: string; name: string; notes: string }[];
  };
}
