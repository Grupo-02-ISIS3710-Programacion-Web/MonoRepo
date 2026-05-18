import { ApiProperty } from '@nestjs/swagger';

export class UpdateDraftDto {
  @ApiProperty({ example: 'Mi rutina matutina' })
  name?: string;

  @ApiProperty({ example: 'Rutina de 4 pasos para piel mixta' })
  description?: string;

  @ApiProperty({ enum: ['am', 'pm'], example: 'am' })
  type?: string;

  @ApiProperty({ example: 'mixta' })
  skinType?: string;

  @ApiProperty({
    type: Array,
    example: [
      {
        id: 'step1',
        name: 'Limpiador',
        order: 0,
        productId: '69f8832d56dcaa1b4eb44a30',
        notes: 'Aplicar sobre piel húmeda',
      },
    ],
  })
  steps?: {
    id: string;
    name: string;
    order: number;
    productId: string;
    notes: string;
  }[];
}

export class UpdateFocusAreasDto {
  @ApiProperty({ example: ['hidratacion', 'barrera'] })
  selectedFocusAreaIds: string[];
}
