import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Usuarios')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id/favorites')
  @ApiOperation({ summary: 'Obtener productos favoritos de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: 'u1' })
  @ApiResponse({ status: 200, description: 'Lista de IDs de productos favoritos' })
  findFavorites(@Param('id') id: string) {
    return this.userService.getFavorites(id);
  }

  @Post(':id/favorites/:productId')
  @ApiOperation({ summary: 'Agregar producto a favoritos' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: 'u1' })
  @ApiParam({ name: 'productId', description: 'ID del producto', example: '69f8832d56dcaa1b4eb44a30' })
  @ApiResponse({ status: 201, description: 'Producto agregado a favoritos' })
  addFavorite(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    return this.userService.addFavorite(id, productId);
  }

  @Delete(':id/favorites/:productId')
  @ApiOperation({ summary: 'Eliminar producto de favoritos' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: 'u1' })
  @ApiParam({ name: 'productId', description: 'ID del producto', example: '69f8832d56dcaa1b4eb44a30' })
  @ApiResponse({ status: 200, description: 'Producto eliminado de favoritos' })
  removeFavorite(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    return this.userService.removeFavorite(id, productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: 'u1' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: 'u1' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: 'u1' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}