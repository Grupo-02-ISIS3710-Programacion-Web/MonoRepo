import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ChatsService } from './chats.service';
import { Chat, ChatSchema } from './entities/chat.entity';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';

describe('ChatsService (with in-memory MongoDB)', () => {
  let service: ChatsService;
  let chatModel: Model<Chat>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(process.env.MONGO_MEMORY_URI),
        MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
      ],
      providers: [ChatsService],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
    chatModel = module.get<Model<Chat>>(getModelToken(Chat.name));
    await chatModel.deleteMany({});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a chat without focus areas', async () => {
      const result = await service.create('u1');
      expect(result).toBeDefined();
      expect(result.userId).toBe('u1');
      expect(result.messages).toEqual([]);
      expect(result.selectedFocusAreaIds).toEqual([]);
      expect(result.deleted).toBe(false);
    });

    it('should create a chat with focus areas', async () => {
      const focusAreas = ['fa1', 'fa2'];
      const result = await service.create('u1', focusAreas);
      expect(result.selectedFocusAreaIds).toEqual(focusAreas);
    });
  });

  describe('findById', () => {
    let chatId: string;

    beforeEach(async () => {
      const chat = await service.create('u1', ['fa1']);
      chatId = (chat as any)._id.toString();
    });

    it('should return chat by id for correct user', async () => {
      const result = await service.findById(chatId, 'u1');
      expect(result).toBeDefined();
      expect(result.userId).toBe('u1');
    });

    it('should throw NotFoundException for wrong user', async () => {
      await expect(service.findById(chatId, 'u2')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for deleted chat', async () => {
      await chatModel.findByIdAndUpdate(chatId, { deleted: true });
      await expect(service.findById(chatId, 'u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    beforeEach(async () => {
      await service.create('u1');
      await service.create('u1');
      await service.create('u2');
    });

    it('should return all chats for user', async () => {
      const result = await service.findByUser('u1');
      expect(result).toHaveLength(2);
    });
  });

  describe('saveMessage', () => {
    let chatId: string;

    beforeEach(async () => {
      const chat = await service.create('u1');
      chatId = (chat as any)._id.toString();
    });

    it('should save a user message', async () => {
      const result = await service.saveMessage(chatId, 'u1', {
        role: 'user',
        content: 'Hola',
      });
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('user');
    });

    it('should throw NotFoundException for wrong user', async () => {
      await expect(
        service.saveMessage(chatId, 'u2', { role: 'user', content: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateDraft', () => {
    let chatId: string;

    beforeEach(async () => {
      const chat = await service.create('u1');
      chatId = (chat as any)._id.toString();
    });

    it('should create draft if not exists', async () => {
      const result = await service.updateDraft(chatId, 'u1', { name: 'Mi Rutina' });
      expect(result.routineDraft).toBeDefined();
      expect(result.routineDraft.name).toBe('Mi Rutina');
    });

    it('should throw NotFoundException for wrong user', async () => {
      await expect(
        service.updateDraft(chatId, 'u2', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateFocusAreas', () => {
    let chatId: string;

    beforeEach(async () => {
      const chat = await service.create('u1', ['fa1']);
      chatId = (chat as any)._id.toString();
    });

    it('should update focus areas', async () => {
      const result = await service.updateFocusAreas(chatId, 'u1', ['fa2', 'fa3']);
      expect(result.selectedFocusAreaIds).toEqual(['fa2', 'fa3']);
    });

    it('should throw NotFoundException for wrong user', async () => {
      await expect(
        service.updateFocusAreas(chatId, 'u2', ['fa2']),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
