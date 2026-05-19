import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SaveMessageDto } from './dto/save-message.dto';
import { UpdateDraftDto, UpdateFocusAreasDto } from './dto/update-draft.dto';

@ApiTags('Chats IA')
@Controller('ai/chats')
export class ChatsController {
  private readonly logger = new Logger(ChatsController.name);

  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva sesión de chat con IA' })
  @ApiBody({ type: CreateChatDto })
  @ApiResponse({
    status: 201,
    description: 'Chat creado',
    schema: { example: { chatId: '69f8832d56dcaa1b4eb44a30' } },
  })
  async create(@Body() dto: CreateChatDto) {
    this.logger.log(
      `Solicitud recibida: POST /ai/chats - Usuario ${dto.userId}`,
    );
    try {
      const chat = await this.chatsService.create(
        dto.userId,
        dto.selectedFocusAreaIds,
      );
      return { chatId: chat.id };
    } catch (error) {
      this.logger.error(
        `Error en POST /ai/chats: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        { message: 'Error al crear el chat', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los chats de un usuario' })
  @ApiQuery({ name: 'userId', required: true, type: String, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de chats' })
  async findByUser(@Query('userId') userId: string) {
    this.logger.log(`Solicitud recibida: GET /ai/chats - Usuario ${userId}`);
    if (!userId) {
      throw new HttpException(
        { message: 'userId is required' },
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.chatsService.findByUser(userId);
    } catch (error) {
      this.logger.error(
        `Error en GET /ai/chats: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        { message: 'Error al obtener los chats', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':chatId')
  @ApiOperation({ summary: 'Obtener un chat por ID' })
  @ApiParam({ name: 'chatId', type: String, description: 'ID del chat' })
  @ApiQuery({ name: 'userId', required: true, type: String, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Chat con estado completo' })
  async findById(
    @Param('chatId') chatId: string,
    @Query('userId') userId: string,
  ) {
    this.logger.log(
      `Solicitud recibida: GET /ai/chats/${chatId} - Usuario ${userId}`,
    );
    if (!userId) {
      throw new HttpException(
        { message: 'userId is required' },
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.chatsService.findById(chatId, userId);
    } catch (error) {
      this.logger.error(
        `Error en GET /ai/chats/${chatId}: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        { message: error.message || 'Chat no encontrado' },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post(':chatId/messages')
  @ApiOperation({ summary: 'Agregar un mensaje al chat' })
  @ApiParam({ name: 'chatId', type: String, description: 'ID del chat' })
  @ApiQuery({ name: 'userId', required: true, type: String, description: 'ID del usuario' })
  @ApiBody({ type: SaveMessageDto })
  @ApiResponse({ status: 201, description: 'Mensaje guardado' })
  async saveMessage(
    @Param('chatId') chatId: string,
    @Query('userId') userId: string,
    @Body() dto: SaveMessageDto,
  ) {
    this.logger.log(
      `Solicitud recibida: POST /ai/chats/${chatId}/messages - Usuario ${userId}, rol: ${dto.role}`,
    );
    if (!userId) {
      throw new HttpException(
        { message: 'userId is required' },
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.chatsService.saveMessage(chatId, userId, {
        role: dto.role,
        content: dto.content,
        recommendedProducts: dto.recommendedProducts,
        draftUpdate: dto.draftUpdate,
      });
    } catch (error) {
      this.logger.error(
        `Error en POST /ai/chats/${chatId}/messages: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        { message: error.message || 'Error al guardar el mensaje' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':chatId/draft')
  @ApiOperation({ summary: 'Actualizar el borrador de rutina en el chat' })
  @ApiParam({ name: 'chatId', type: String, description: 'ID del chat' })
  @ApiQuery({ name: 'userId', required: true, type: String, description: 'ID del usuario' })
  @ApiBody({ type: UpdateDraftDto })
  @ApiResponse({ status: 200, description: 'Borrador actualizado' })
  async updateDraft(
    @Param('chatId') chatId: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateDraftDto,
  ) {
    this.logger.log(
      `Solicitud recibida: PATCH /ai/chats/${chatId}/draft - Usuario ${userId}`,
    );
    if (!userId) {
      throw new HttpException(
        { message: 'userId is required' },
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.chatsService.updateDraft(chatId, userId, {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        skinType: dto.skinType,
        steps: dto.steps,
      });
    } catch (error) {
      this.logger.error(
        `Error en PATCH /ai/chats/${chatId}/draft: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        { message: error.message || 'Error al actualizar el borrador' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':chatId/focus-areas')
  @ApiOperation({ summary: 'Actualizar áreas de enfoque seleccionadas' })
  @ApiParam({ name: 'chatId', type: String, description: 'ID del chat' })
  @ApiQuery({ name: 'userId', required: true, type: String, description: 'ID del usuario' })
  @ApiBody({ type: UpdateFocusAreasDto })
  @ApiResponse({ status: 200, description: 'Áreas de enfoque actualizadas' })
  async updateFocusAreas(
    @Param('chatId') chatId: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateFocusAreasDto,
  ) {
    this.logger.log(
      `Solicitud recibida: PATCH /ai/chats/${chatId}/focus-areas - Usuario ${userId}`,
    );
    if (!userId) {
      throw new HttpException(
        { message: 'userId is required' },
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.chatsService.updateFocusAreas(
        chatId,
        userId,
        dto.selectedFocusAreaIds,
      );
    } catch (error) {
      this.logger.error(
        `Error en PATCH /ai/chats/${chatId}/focus-areas: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          message: error.message || 'Error al actualizar las áreas de enfoque',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
