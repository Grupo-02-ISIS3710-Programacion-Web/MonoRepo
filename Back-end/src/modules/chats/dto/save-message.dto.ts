import { ApiProperty } from '@nestjs/swagger';

export class SaveMessageDto {
  @ApiProperty({
    description: 'Message role',
    enum: ['user', 'assistant'],
    example: 'user',
  })
  role: string;

  @ApiProperty({ description: 'Message content', example: 'What routine should I use for oily skin?' })
  content: string;

  @ApiProperty({
    description: 'Recommended products (only for assistant messages)',
    required: false,
    example: [
      {
        productId: '69f8832d56dcaa1b4eb44a30',
        reason: 'Controls excess oil without drying',
        otherAlternatives: [
          { id: '69f8832d56dcaa1b4eb44a27', reason: 'Gentle alternative' },
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
    description: 'Draft update suggestion',
    required: false,
  })
  draftUpdate?: {
    steps?: { productId: string; name: string; notes: string }[];
  };
}
