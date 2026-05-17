import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Logger } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RutinasService } from './rutinas.service';
import { CreateRutinaDto } from './dto/create-rutina.dto';
import { UpdateRutinaDto } from './dto/update-rutina.dto';
import { Rutina } from './entities/rutina.entity';

@ApiTags('Rutinas')
@Controller('rutinas')
export class RutinasController {
  private readonly logger = new Logger(RutinasController.name);

  constructor(private readonly rutinasService: RutinasService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear una nueva rutina',
    description: 'Crea una nueva rutina de cuidado de la piel asociada a un usuario. Requiere todos los campos obligatorios.'
  })
  @ApiBody({
    type: CreateRutinaDto,
    examples: {
      ejemploCrearRutina: {
        summary: 'Ejemplo de creación de rutina',
        value: {
          userId: 'u1',
          name: 'Rutina de mañana',
          description: 'Rutina ligera para piel mixta.',
          type: 'am',
          skinType: 'mixta',
          steps: [
            { id: 'r1s1', name: 'Cleanser', order: 0, productId: '12', notes: 'Aplicar sobre piel húmeda' },
            { id: 'r1s2', name: 'Sunscreen', order: 1, productId: '10', notes: 'Finalizar con protector solar' },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Rutina creada exitosamente', type: Rutina })
  @ApiResponse({ status: 400, description: 'Datos inválidos proporcionados' })
  create(@Body() createRutinaDto: CreateRutinaDto) {
    this.logger.log(`Solicitud recibida: POST /rutinas - Usuario ${createRutinaDto.userId}, rutina "${createRutinaDto.name}"`);
    try {
      return this.rutinasService.create(createRutinaDto);
    } catch (error) {
      this.logger.error(`Error en POST /rutinas: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las rutinas',
    description: 'Lista todas las rutinas activas (no eliminadas) con paginación y opciones de ordenamiento.'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página (por defecto: 1)',
    example: '1'
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Criterio de ordenamiento: newest (más recientes), mostCommented (más comentadas), mostVoted (más votadas)',
    enum: ['newest', 'mostCommented', 'mostVoted'],
    example: 'newest'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de rutinas obtenida exitosamente',
    schema: {
      example: {
        routines: [
          {
            _id: '69f7d7dbd2f0941fab0fb0f5',
            userId: 'u1',
            name: 'Rutina básica de mañana',
            description: 'Rutina sencilla de 3 pasos para comenzar el día',
            type: 'am',
            skinType: 'normal',
            steps: [],
            views: 1240,
            upvotes: ['u2', 'u3'],
            downvotes: [],
            publishedAt: '2026-03-14T09:20:00.000Z',
            deleted: false
          }
        ],
        total: 20,
        page: 1,
        pageSize: 20,
        totalPages: 1
      }
    }
  })
  findAll(
    @Query('page') page?: string,
    @Query('sort') sort?: 'newest' | 'mostCommented' | 'mostVoted',
  ) {
    this.logger.log(`Solicitud recibida: GET /rutinas - página ${page || '1'}, orden: ${sort || 'newest'}`);
    try {
      const pageNum = page ? parseInt(page, 10) : undefined;
      return this.rutinasService.findAll(pageNum, sort);
    } catch (error) {
      this.logger.error(`Error en GET /rutinas: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obtener rutinas por usuario',
    description: 'Lista todas las rutinas creadas por un usuario específico, ordenadas por número de visualizaciones.'
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: 'u1'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página (por defecto: 1)',
    example: '1'
  })
  @ApiResponse({ status: 200, description: 'Rutinas del usuario obtenidas exitosamente' })
  findByUserId(@Param('userId') userId: string, @Query('page') page: string = '1') {
    this.logger.log(`Solicitud recibida: GET /rutinas/user/${userId} - página ${page}`);
    try {
      return this.rutinasService.findByUserId(userId, parseInt(page, 10));
    } catch (error) {
      this.logger.error(`Error en GET /rutinas/user/${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una rutina por ID',
    description: 'Obtiene los detalles completos de una rutina específica por su ID.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la rutina (MongoDB ObjectId)',
    example: '69f7d7dbd2f0941fab0fb0f5'
  })
  @ApiResponse({ status: 200, description: 'Rutina encontrada', type: Rutina })
  @ApiResponse({ status: 404, description: 'Rutina no encontrada' })
  findOne(@Param('id') id: string) {
    this.logger.log(`Solicitud recibida: GET /rutinas/${id}`);
    try {
      return this.rutinasService.findOne(id);
    } catch (error) {
      this.logger.error(`Error en GET /rutinas/${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una rutina',
    description: 'Actualiza parcial o totalmente una rutina existente. Solo se actualizan los campos proporcionados.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la rutina a actualizar',
    example: '69f7d7dbd2f0941fab0fb0f5'
  })
  @ApiBody({
    type: UpdateRutinaDto,
    examples: {
      ejemploActualizarRutina: {
        summary: 'Ejemplo de actualización de rutina',
        value: {
          name: 'Rutina de mañana (actualizada)',
          description: 'Se agrega paso de antioxidante.',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Rutina actualizada exitosamente', type: Rutina })
  @ApiResponse({ status: 404, description: 'Rutina no encontrada' })
  update(@Param('id') id: string, @Body() updateRutinaDto: UpdateRutinaDto) {
    this.logger.log(`Solicitud recibida: PATCH /rutinas/${id}`);
    try {
      return this.rutinasService.update(id, updateRutinaDto);
    } catch (error) {
      this.logger.error(`Error en PATCH /rutinas/${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar rutina (borrado lógico)',
    description: 'Realiza un borrado lógico de la rutina, marcándola como eliminada sin borrarla de la base de datos.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la rutina a eliminar',
    example: '69f7d7dbd2f0941fab0fb0f5'
  })
  @ApiResponse({ status: 200, description: 'Rutina eliminada exitosamente (borrado lógico)' })
  @ApiResponse({ status: 404, description: 'Rutina no encontrada' })
  softDelete(@Param('id') id: string) {
    this.logger.log(`Solicitud recibida: DELETE /rutinas/${id} (borrado lógico)`);
    try {
      return this.rutinasService.softDelete(id);
    } catch (error) {
      this.logger.error(`Error en DELETE /rutinas/${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Delete(':id/hardDelete')
  @ApiOperation({
    summary: 'Eliminar rutina permanentemente (borrado físico)',
    description: 'Elimina la rutina permanentemente de la base de datos. Esta acción no se puede deshacer.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la rutina a eliminar permanentemente',
    example: '69f7d7dbd2f0941fab0fb0f5'
  })
  @ApiResponse({ status: 200, description: 'Rutina eliminada permanentemente' })
  @ApiResponse({ status: 404, description: 'Rutina no encontrada' })
  hardDelete(@Param('id') id: string) {
    this.logger.log(`Solicitud recibida: DELETE /rutinas/${id}/hardDelete (borrado físico)`);
    try {
      return this.rutinasService.hardDelete(id);
    } catch (error) {
      this.logger.error(`Error en DELETE /rutinas/${id}/hardDelete: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post(':id/upvote')
  @ApiOperation({
    summary: 'Votar positivamente una rutina',
    description: 'Agrega un voto positivo de un usuario a la rutina. Si el usuario ya había votado negativo, se cambia a positivo. Si ya había votado positivo, se remueve el voto.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la rutina a votar',
    example: '69f7d7dbd2f0941fab0fb0f5'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID del usuario que vota',
          example: 'u2'
        }
      },
      required: ['userId']
    }
  })
  @ApiResponse({ status: 200, description: 'Voto positivo registrado exitosamente', type: Rutina })
  @ApiResponse({ status: 404, description: 'Rutina no encontrada' })
  upvote(@Param('id') id: string, @Body('userId') userId: string) {
    this.logger.log(`Solicitud recibida: POST /rutinas/${id}/upvote - Usuario ${userId}`);
    try {
      return this.rutinasService.upvote(id, userId);
    } catch (error) {
      this.logger.error(`Error en POST /rutinas/${id}/upvote: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post(':id/downvote')
  @ApiOperation({
    summary: 'Votar negativamente una rutina',
    description: 'Agrega un voto negativo de un usuario a la rutina. Si el usuario ya había votado positivo, se cambia a negativo. Si ya había votado negativo, se remueve el voto.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la rutina a votar negativamente',
    example: '69f7d7dbd2f0941fab0fb0f5'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID del usuario que vota',
          example: 'u6'
        }
      },
      required: ['userId']
    }
  })
  @ApiResponse({ status: 200, description: 'Voto negativo registrado exitosamente', type: Rutina })
  @ApiResponse({ status: 404, description: 'Rutina no encontrada' })
  downvote(@Param('id') id: string, @Body('userId') userId: string) {
    this.logger.log(`Solicitud recibida: POST /rutinas/${id}/downvote - Usuario ${userId}`);
    try {
      return this.rutinasService.downvote(id, userId);
    } catch (error) {
      this.logger.error(`Error en POST /rutinas/${id}/downvote: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post(':id/remove-upvote')
  @ApiOperation({
    summary: 'Remover voto positivo',
    description: 'Remueve el voto positivo de un usuario de la rutina, si existe.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la rutina',
    example: '69f7d7dbd2f0941fab0fb0f5'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID del usuario',
          example: 'u2'
        }
      },
      required: ['userId']
    }
  })
  @ApiResponse({ status: 200, description: 'Voto positivo removido exitosamente', type: Rutina })
  @ApiResponse({ status: 404, description: 'Rutina no encontrada' })
  removeUpvote(@Param('id') id: string, @Body('userId') userId: string) {
    this.logger.log(`Solicitud recibida: POST /rutinas/${id}/remove-upvote - Usuario ${userId}`);
    try {
      return this.rutinasService.removeUpvote(id, userId);
    } catch (error) {
      this.logger.error(`Error en POST /rutinas/${id}/remove-upvote: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post(':id/remove-downvote')
  @ApiOperation({
    summary: 'Remover voto negativo',
    description: 'Remueve el voto negativo de un usuario de la rutina, si existe.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la rutina',
    example: '69f7d7dbd2f0941fab0fb0f5'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID del usuario',
          example: 'u6'
        }
      },
      required: ['userId']
    }
  })
  @ApiResponse({ status: 200, description: 'Voto negativo removido exitosamente', type: Rutina })
  @ApiResponse({ status: 404, description: 'Rutina no encontrada' })
  removeDownvote(@Param('id') id: string, @Body('userId') userId: string) {
    this.logger.log(`Solicitud recibida: POST /rutinas/${id}/remove-downvote - Usuario ${userId}`);
    try {
      return this.rutinasService.removeDownvote(id, userId);
    } catch (error) {
      this.logger.error(`Error en POST /rutinas/${id}/remove-downvote: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post(':id/view')
  @ApiOperation({
    summary: 'Incrementar contador de visualizaciones',
    description: 'Incrementa en 1 el contador de visualizaciones de la rutina.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la rutina',
    example: '69f7d7dbd2f0941fab0fb0f5'
  })
  @ApiResponse({ status: 200, description: 'Visualización registrada exitosamente', type: Rutina })
  @ApiResponse({ status: 404, description: 'Rutina no encontrada' })
  incrementView(@Param('id') id: string) {
    this.logger.debug(`Solicitud recibida: POST /rutinas/${id}/view`);
    try {
      return this.rutinasService.incrementView(id);
    } catch (error) {
      this.logger.error(`Error en POST /rutinas/${id}/view: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id/votes')
  @ApiOperation({
    summary: 'Obtener conteo de votos y visualizaciones',
    description: 'Obtiene el número de votos positivos, negativos y visualizaciones de una rutina.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la rutina',
    example: '69f7d7dbd2f0941fab0fb0f5'
  })
  @ApiResponse({
    status: 200,
    description: 'Conteo de votos obtenido exitosamente',
    schema: {
      example: {
        upvotes: 3,
        downvotes: 1,
        views: 1240
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Rutina no encontrada' })
  getVoteCounts(@Param('id') id: string) {
    this.logger.debug(`Solicitud recibida: GET /rutinas/${id}/votes`);
    try {
      return this.rutinasService.getVoteCounts(id);
    } catch (error) {
      this.logger.error(`Error en GET /rutinas/${id}/votes: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Obtener comentarios de una rutina' })
  @ApiParam({ name: 'id', description: 'ID de la rutina' })
  @ApiResponse({ status: 200, description: 'Comentarios obtenidos exitosamente' })
  getComments(@Param('id') id: string) {
    this.logger.log(`Solicitud recibida: GET /rutinas/${id}/comments`);
    try {
      return this.rutinasService.getComments(id);
    } catch (error) {
      this.logger.error(`Error en GET /rutinas/${id}/comments: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Agregar comentario a una rutina' })
  @ApiParam({ name: 'id', description: 'ID de la rutina' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'u1' },
        comment: { type: 'string', example: 'Excelente rutina!' },
      },
      required: ['userId', 'comment'],
    },
  })

  @ApiResponse({ status: 201, description: 'Comentario agregado exitosamente' })
  addComment(@Param('id') id: string, @Body() body: { userId: string; comment: string }) {
    this.logger.log(`Solicitud recibida: POST /rutinas/${id}/comments - Usuario ${body.userId}`);
    try {
      return this.rutinasService.addComment(id, body.userId, body.comment);
    } catch (error) {
      this.logger.error(`Error en POST /rutinas/${id}/comments: ${error.message}`, error.stack);
      throw error;
    }
  }
}
