import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatMessage } from './entities/chat.entity';

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);

  constructor(
    @InjectModel('Chat') private readonly chatModel: Model<Chat>,
  ) { }

  async create(userId: string, selectedFocusAreaIds?: string[]): Promise<Chat> {
    const chat = new this.chatModel({
      userId,
      messages: [],
      selectedFocusAreaIds: selectedFocusAreaIds || [],
      deleted: false,
    });
    return await chat.save();
  }

  async findById(chatId: string, userId: string): Promise<Chat> {
    const chat = await this.chatModel.findOne({ _id: chatId, userId, deleted: false }).exec();
    if (!chat) {
      throw new NotFoundException(`Chat ${chatId} not found`);
    }
    return chat;
  }

  async findByUser(userId: string): Promise<Chat[]> {
    return await this.chatModel.find({ userId, deleted: false }).sort({ updatedAt: -1 }).exec();
  }

  async saveMessage(chatId: string, userId: string, message: {
    role: string;
    content: string;
    recommendedProducts?: any[];
    draftUpdate?: any;
  }): Promise<Chat> {
    const chat = await this.findById(chatId, userId);

    const chatMessage: ChatMessage = {
      role: message.role,
      content: message.content,
      recommendedProducts: message.recommendedProducts || [],
      draftUpdate: message.draftUpdate,
      timestamp: new Date(),
    };

    chat.messages.push(chatMessage);
    return await chat.save();
  }

  async updateDraft(chatId: string, userId: string, draft: {
    name?: string;
    description?: string;
    type?: string;
    skinType?: string;
    steps?: any[];
  }): Promise<Chat> {
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
    if (draft.description !== undefined) chat.routineDraft.description = draft.description;
    if (draft.type !== undefined) chat.routineDraft.type = draft.type;
    if (draft.skinType !== undefined) chat.routineDraft.skinType = draft.skinType;
    if (draft.steps !== undefined) chat.routineDraft.steps = draft.steps;

    return await chat.save();
  }

  async updateFocusAreas(chatId: string, userId: string, selectedFocusAreaIds: string[]): Promise<Chat> {
    const chat = await this.findById(chatId, userId);
    chat.selectedFocusAreaIds = selectedFocusAreaIds;
    return await chat.save();
  }
}
