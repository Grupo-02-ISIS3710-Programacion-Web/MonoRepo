import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { ComentariosService } from './comentarios.service';

@ApiTags('Comentarios')
@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un comentario' })
  @ApiBody({
    type: CreateComentarioDto,
    examples: {
      ejemploCrearComentario: {
        summary: 'Crear comentario',
        value: {
          userId: 'user-123',
          comment: 'Me funcionó muy bien esta rutina.',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Comentario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createComentarioDto: CreateComentarioDto) {
    return this.comentariosService.create(createComentarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los comentarios' })
  @ApiResponse({ status: 200, description: 'Lista de comentarios' })
  findAll() {
    return this.comentariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un comentario por ID' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiResponse({ status: 200, description: 'Comentario encontrado' })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado' })
  findOne(@Param('id') id: string) {
    return this.comentariosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un comentario' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiBody({
    type: UpdateComentarioDto,
    examples: {
      ejemploActualizarComentario: {
        summary: 'Actualizar comentario',
        value: {
          comment: 'Actualizo: después de una semana vi mejores resultados.',
          upvotes: ['user-200'],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Comentario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateComentarioDto: UpdateComentarioDto,
  ) {
    return this.comentariosService.update(id, updateComentarioDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un comentario' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiResponse({ status: 200, description: 'Comentario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado' })
  remove(@Param('id') id: string) {
    return this.comentariosService.remove(id);
  }

  @Post(':id/upvote')
  @ApiOperation({ summary: 'Votar positivamente un comentario' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'ID del usuario que vota', example: 'user-200' },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Voto registrado exitosamente' })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado' })
  upvote(@Param('id') id: string, @Body('userId') userId: string) {
    return this.comentariosService.upvote(id, userId);
  }

  @Post(':id/downvote')
  @ApiOperation({ summary: 'Votar negativamente un comentario' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID del usuario que vota',
          example: 'user-200',
        },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Voto negativo registrado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Comentario no encontrado',
  })
  downvote(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.comentariosService.downvote(
      id,
      userId,
    );
  }

  @Get('producto/:productId')
  @ApiOperation({ summary: 'Obtener comentarios por producto' })
  @ApiParam({ name: 'productId', type: String, description: 'ID del producto', example: '69f8832d56dcaa1b4eb44a30' })
  @ApiResponse({ status: 200, description: 'Comentarios del producto' })
  findByProductId(@Param('productId') productId: string) {
    return this.comentariosService.findByProductId(productId);
  }
}
