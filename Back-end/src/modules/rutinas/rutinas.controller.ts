import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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
          skinType: 4,
          steps: [
            { order: 1, productId: 'producto-1', notes: 'Aplicar sobre piel húmeda' },
            { order: 2, productId: 'producto-2', notes: 'Finalizar con protector solar' },
          ],
        },
      },
    },
  })
  create(@Body() createRutinaDto: CreateRutinaDto) {
    return this.rutinasService.create(createRutinaDto);
  }

  @Get()
  findAll() {
    return this.rutinasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rutinasService.findOne(+id);
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
    return this.rutinasService.update(+id, updateRutinaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rutinasService.remove(+id);
  }
}
