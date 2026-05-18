import { ApiProperty } from '@nestjs/swagger';

export class BatchProductoDto {
  @ApiProperty({
    description: 'Arreglo de IDs de productos a obtener',
    example: ['69f8832d56dcaa1b4eb44a30'],
  })
  productIds: string[];

  @ApiProperty({
    description: 'Incluir el vector de embedding en la respuesta (por defecto: false)',
    required: false,
    default: false,
  })
  includeEmbeddings?: boolean;
}
