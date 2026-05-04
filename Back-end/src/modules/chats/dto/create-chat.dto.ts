import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({ description: 'User ID', example: 'u1' })
  userId: string;

  @ApiProperty({ description: 'Selected focus area IDs', example: ['hydration', 'barrier'] })
  selectedFocusAreaIds?: string[];
}
