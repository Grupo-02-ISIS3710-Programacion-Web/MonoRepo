import { ApiProperty } from '@nestjs/swagger';

export class CreateComentarioDto {
  @ApiProperty({ description: 'ID del usuario que comenta', example: 'u1' })
  userId: string;

  @ApiProperty({ description: 'ID del producto comentado', example: '69f8832d56dcaa1b4eb44a30' })
  productId: string;

  @ApiProperty({ description: 'Contenido del comentario', example: 'Me funcionó muy bien esta rutina.' })
  comment: string;
}
