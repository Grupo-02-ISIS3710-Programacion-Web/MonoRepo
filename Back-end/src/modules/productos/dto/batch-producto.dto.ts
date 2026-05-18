import { ApiProperty } from '@nestjs/swagger';

export class BatchProductoDto {
  @ApiProperty({
    description: 'Array of product IDs to fetch',
    example: ['69f8832d56dcaa1b4eb44a30'],
  })
  productIds: string[];

  @ApiProperty({
    description: 'Include the embedding vector in the response (default: false)',
    required: false,
    default: false,
  })
  includeEmbeddings?: boolean;
}
