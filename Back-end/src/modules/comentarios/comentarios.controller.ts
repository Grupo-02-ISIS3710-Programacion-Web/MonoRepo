import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { ComentariosService } from './comentarios.service';

@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) { }

  @Post()
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
  create(@Body() createComentarioDto: CreateComentarioDto) {
    return this.comentariosService.create(createComentarioDto);
  }

  @Get()
  findAll() {
    return this.comentariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comentariosService.findOne(id);
  }

  @Patch(':id')
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
  update(@Param('id') id: string, @Body() updateComentarioDto: UpdateComentarioDto) {
    return this.comentariosService.update(id, updateComentarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comentariosService.remove(id);
  }

  @Post(':id/upvote')
  upvote(@Param('id') id: string, @Body('userId') userId: string) {
    return this.comentariosService.upvote(id, userId);
  }
}
