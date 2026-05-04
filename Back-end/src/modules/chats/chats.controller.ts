import { Controller, Get, Post, Patch, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SaveMessageDto } from './dto/save-message.dto';
import { UpdateDraftDto, UpdateFocusAreasDto } from './dto/update-draft.dto';

@ApiTags('AI Chats')
@Controller('ai/chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new AI chat session' })
  @ApiBody({ type: CreateChatDto })
  @ApiResponse({ status: 201, description: 'Chat created', schema: { example: { chatId: '69f8832d56dcaa1b4eb44a30' } } })
  async create(@Body() dto: CreateChatDto) {
    try {
      const chat = await this.chatsService.create(dto.userId, dto.selectedFocusAreaIds);
      return { chatId: chat.id };
    } catch (error) {
      throw new HttpException(
        { message: 'Error creating chat', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all chats for a user' })
  @ApiResponse({ status: 200, description: 'List of chats' })
  async findByUser(@Query('userId') userId: string) {
    if (!userId) {
      throw new HttpException({ message: 'userId is required' }, HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.chatsService.findByUser(userId);
    } catch (error) {
      throw new HttpException(
        { message: 'Error fetching chats', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':chatId')
  @ApiOperation({ summary: 'Get a chat by ID' })
  @ApiResponse({ status: 200, description: 'Chat with full state' })
  async findById(@Param('chatId') chatId: string, @Query('userId') userId: string) {
    if (!userId) {
      throw new HttpException({ message: 'userId is required' }, HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.chatsService.findById(chatId, userId);
    } catch (error) {
      throw new HttpException(
        { message: error.message || 'Chat not found' },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post(':chatId/messages')
  @ApiOperation({ summary: 'Append a message to the chat' })
  @ApiBody({ type: SaveMessageDto })
  @ApiResponse({ status: 201, description: 'Message saved' })
  async saveMessage(
    @Param('chatId') chatId: string,
    @Query('userId') userId: string,
    @Body() dto: SaveMessageDto,
  ) {
    if (!userId) {
      throw new HttpException({ message: 'userId is required' }, HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.chatsService.saveMessage(chatId, userId, {
        role: dto.role,
        content: dto.content,
        recommendedProducts: dto.recommendedProducts,
        draftUpdate: dto.draftUpdate,
      });
    } catch (error) {
      throw new HttpException(
        { message: error.message || 'Error saving message' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':chatId/draft')
  @ApiOperation({ summary: 'Update the routine draft in the chat' })
  @ApiBody({ type: UpdateDraftDto })
  @ApiResponse({ status: 200, description: 'Draft updated' })
  async updateDraft(
    @Param('chatId') chatId: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateDraftDto,
  ) {
    if (!userId) {
      throw new HttpException({ message: 'userId is required' }, HttpStatus.BAD_REQUEST);
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
      throw new HttpException(
        { message: error.message || 'Error updating draft' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':chatId/focus-areas')
  @ApiOperation({ summary: 'Update selected focus areas' })
  @ApiBody({ type: UpdateFocusAreasDto })
  @ApiResponse({ status: 200, description: 'Focus areas updated' })
  async updateFocusAreas(
    @Param('chatId') chatId: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateFocusAreasDto,
  ) {
    if (!userId) {
      throw new HttpException({ message: 'userId is required' }, HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.chatsService.updateFocusAreas(chatId, userId, dto.selectedFocusAreaIds);
    } catch (error) {
      throw new HttpException(
        { message: error.message || 'Error updating focus areas' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
