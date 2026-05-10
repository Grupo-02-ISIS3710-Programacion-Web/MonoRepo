import { ApiProperty } from '@nestjs/swagger';

export class UpdateDraftDto {
  @ApiProperty({ example: 'My morning routine' })
  name?: string;

  @ApiProperty({ example: 'A 4-step routine for combination skin' })
  description?: string;

  @ApiProperty({ enum: ['am', 'pm'], example: 'am' })
  type?: string;

  @ApiProperty({ example: 'mixta' })
  skinType?: string;

  @ApiProperty({
    type: Array,
    example: [
      { id: 'step1', name: 'Cleanser', order: 0, productId: '69f8832d56dcaa1b4eb44a30', notes: 'Apply on damp skin' },
    ],
  })
  steps?: { id: string; name: string; order: number; productId: string; notes: string }[];
}

export class UpdateFocusAreasDto {
  @ApiProperty({ example: ['hydration', 'barrier'] })
  selectedFocusAreaIds: string[];
}
