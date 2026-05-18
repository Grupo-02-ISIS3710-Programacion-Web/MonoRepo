import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({ description: 'ID del usuario', example: 'u1' })
  userId: string;

  @ApiProperty({
    description: 'IDs de áreas de enfoque seleccionadas',
    example: ['hydration', 'barrier'],
  })
  selectedFocusAreaIds?: string[];
}
