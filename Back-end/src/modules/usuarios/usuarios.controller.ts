import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ApiBody({
    type: CreateUsuarioDto,
    examples: {
      ejemploCrearUsuario: {
        summary: 'Crear usuario',
        value: {
          email: 'ana@example.com',
          username: 'anaskin',
          password: 'Password123!',
          skinType: 4,
          concerns: [6, 8],
        },
      },
    },
  })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @Patch(':id')
  @ApiBody({
    type: UpdateUsuarioDto,
    examples: {
      ejemploActualizarUsuario: {
        summary: 'Actualizar usuario',
        value: {
          username: 'ana.skin',
          concerns: [6],
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }
}
