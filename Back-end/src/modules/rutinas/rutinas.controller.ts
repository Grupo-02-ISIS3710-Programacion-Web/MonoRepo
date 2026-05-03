import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { RutinasService } from './rutinas.service';
import { CreateRutinaDto } from './dto/create-rutina.dto';
import { UpdateRutinaDto } from './dto/update-rutina.dto';

@Controller('rutinas')
export class RutinasController {
  constructor(private readonly rutinasService: RutinasService) {}

  @Post()
  @ApiBody({
    type: CreateRutinaDto,
    examples: {
      ejemploCrearRutina: {
        summary: 'Crear rutina',
        value: {
          userId: 'user-123',
          name: 'Rutina de mañana',
          description: 'Rutina ligera para piel mixta.',
          type: 'morning',
          skinType: 'mixta',
          steps: [
            { id: '1', name: 'Cleanser', order: 1, productId: 'producto-1', notes: 'Aplicar sobre piel húmeda' },
            { id: '2', name: 'Sunscreen', order: 2, productId: 'producto-2', notes: 'Finalizar con protector solar' },
          ],
        },
      },
    },
  })
  create(@Body() createRutinaDto: CreateRutinaDto) {
    return this.rutinasService.create(createRutinaDto);
  }

  @Get()
  findAll(@Query('page') page?: string) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    return this.rutinasService.findAll(pageNum);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string, @Query('page') page: string = '1') {
    return this.rutinasService.findByUserId(userId, parseInt(page, 10));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rutinasService.findOne(id);
  }

  @Patch(':id')
  @ApiBody({
    type: UpdateRutinaDto,
    examples: {
      ejemploActualizarRutina: {
        summary: 'Actualizar rutina',
        value: {
          name: 'Rutina de mañana (actualizada)',
          description: 'Se agrega paso de antioxidante.',
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateRutinaDto: UpdateRutinaDto) {
    return this.rutinasService.update(id, updateRutinaDto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.rutinasService.softDelete(id);
  }

  @Delete(':id/hardDelete')
  hardDelete(@Param('id') id: string) {
    return this.rutinasService.hardDelete(id);
  }

  @Post(':id/upvote')
  upvote(@Param('id') id: string, @Body('userId') userId: string) {
    return this.rutinasService.upvote(id, userId);
  }

  @Post(':id/downvote')
  downvote(@Param('id') id: string, @Body('userId') userId: string) {
    return this.rutinasService.downvote(id, userId);
  }

  @Post(':id/remove-upvote')
  removeUpvote(@Param('id') id: string, @Body('userId') userId: string) {
    return this.rutinasService.removeUpvote(id, userId);
  }

  @Post(':id/remove-downvote')
  removeDownvote(@Param('id') id: string, @Body('userId') userId: string) {
    return this.rutinasService.removeDownvote(id, userId);
  }

  @Post(':id/view')
  incrementView(@Param('id') id: string) {
    return this.rutinasService.incrementView(id);
  }

  @Get(':id/votes')
  getVoteCounts(@Param('id') id: string) {
    return this.rutinasService.getVoteCounts(id);
  }
}
