import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatMessage } from './entities/chat.entity';

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);

  constructor(@InjectModel('Chat') private readonly chatModel: Model<Chat>) {}

  async create(userId: string, selectedFocusAreaIds?: string[]): Promise<Chat> {
    this.logger.log(
      `Creando chat para usuario ${userId}${selectedFocusAreaIds?.length ? `, áreas de enfoque: ${selectedFocusAreaIds.join(', ')}` : ''}`,
    );
    try {
      const chat = new this.chatModel({
        userId,
        messages: [],
        selectedFocusAreaIds: selectedFocusAreaIds || [],
        deleted: false,
      });
      const saved = await chat.save();
      this.logger.log(
        `Chat creado con ID: ${saved._id} para usuario ${userId}`,
      );
      return saved;
    } catch (error) {
      this.logger.error(
        `Error al crear chat para usuario ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findById(chatId: string, userId: string): Promise<Chat> {
    this.logger.log(`Cargando chat ${chatId} para usuario ${userId}`);
    try {
      const chat = await this.chatModel
        .findOne({ _id: chatId, userId, deleted: false })
        .exec();
      if (!chat) {
        this.logger.warn(
          `Chat no encontrado: ${chatId} para usuario ${userId}`,
        );
        throw new NotFoundException(`Chat ${chatId} not found`);
      }
      this.logger.log(
        `Chat ${chatId} cargado: ${chat.messages?.length || 0} mensajes${chat.routineDraft?.steps?.length ? `, ${chat.routineDraft.steps.length} pasos en borrador` : ''}`,
      );
      return chat;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Error al cargar chat ${chatId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByUser(userId: string): Promise<Chat[]> {
    this.logger.log(`Listando chats para usuario ${userId}`);
    try {
      const chats = await this.chatModel
        .find({ userId, deleted: false })
        .sort({ updatedAt: -1 })
        .exec();
      this.logger.log(
        `Chats encontrados para usuario ${userId}: ${chats.length}`,
      );
      return chats;
    } catch (error) {
      this.logger.error(
        `Error al listar chats del usuario ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async saveMessage(
    chatId: string,
    userId: string,
    message: {
      role: string;
      content: string;
      recommendedProducts?: any[];
      draftUpdate?: any;
    },
  ): Promise<Chat> {
    this.logger.log(
      `Guardando mensaje en chat ${chatId}: rol=${message.role}, contenido=${message.content.substring(0, 50)}...`,
    );
    try {
      const chat = await this.findById(chatId, userId);

      const chatMessage: ChatMessage = {
        role: message.role,
        content: message.content,
        recommendedProducts: message.recommendedProducts || [],
        draftUpdate: message.draftUpdate,
        timestamp: new Date(),
      };

      chat.messages.push(chatMessage);
      const saved = await chat.save();
      this.logger.log(
        `Mensaje guardado en chat ${chatId}: total de mensajes=${chat.messages.length}${message.recommendedProducts?.length ? `, ${message.recommendedProducts.length} productos recomendados` : ''}`,
      );
      return saved;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Error al guardar mensaje en chat ${chatId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateDraft(
    chatId: string,
    userId: string,
    draft: {
      name?: string;
      description?: string;
      type?: string;
      skinType?: string;
      steps?: any[];
    },
  ): Promise<Chat> {
    this.logger.log(
      `Actualizando borrador en chat ${chatId}: nombre="${draft.name || 'sin cambios'}", pasos=${draft.steps?.length || 0}`,
    );
    try {
      const chat = await this.findById(chatId, userId);

      if (!chat.routineDraft) {
        chat.routineDraft = {
          name: '',
          description: '',
          type: 'am',
          skinType: '',
          steps: [],
        };
      }

      if (draft.name !== undefined) chat.routineDraft.name = draft.name;
      if (draft.description !== undefined)
        chat.routineDraft.description = draft.description;
      if (draft.type !== undefined) chat.routineDraft.type = draft.type;
      if (draft.skinType !== undefined)
        chat.routineDraft.skinType = draft.skinType;
      if (draft.steps !== undefined) chat.routineDraft.steps = draft.steps;

      const saved = await chat.save();
      this.logger.log(
        `Borrador actualizado en chat ${chatId}: ${chat.routineDraft.steps.length} pasos`,
      );
      return saved;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Error al actualizar borrador en chat ${chatId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateFocusAreas(
    chatId: string,
    userId: string,
    selectedFocusAreaIds: string[],
  ): Promise<Chat> {
    this.logger.log(
      `Actualizando áreas de enfoque en chat ${chatId}: ${selectedFocusAreaIds.join(', ')}`,
    );
    try {
      const chat = await this.findById(chatId, userId);
      chat.selectedFocusAreaIds = selectedFocusAreaIds;
      const saved = await chat.save();
      this.logger.log(`Áreas de enfoque actualizadas en chat ${chatId}`);
      return saved;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Error al actualizar áreas de enfoque en chat ${chatId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
