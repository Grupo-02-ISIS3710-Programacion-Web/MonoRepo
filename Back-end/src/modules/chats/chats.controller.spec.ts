import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { Chat, ChatSchema } from './entities/chat.entity';
import { HttpException } from '@nestjs/common';
import { Model } from 'mongoose';

describe('ChatsController (with in-memory MongoDB)', () => {
  let controller: ChatsController;
  let service: ChatsService;
  let chatModel: Model<Chat>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(process.env.MONGO_MEMORY_URI),
        MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
      ],
      controllers: [ChatsController],
      providers: [ChatsService],
    }).compile();

    controller = module.get<ChatsController>(ChatsController);
    service = module.get<ChatsService>(ChatsService);
    chatModel = module.get<Model<Chat>>(getModelToken(Chat.name));
    await chatModel.deleteMany({});
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a chat', async () => {
      const dto: any = { userId: 'u1', selectedFocusAreaIds: ['fa1'] };
      const result = await controller.create(dto);
      expect(result).toHaveProperty('chatId');
    });
  });

  describe('findByUser', () => {
    it('should return user chats', async () => {
      await service.create('u1');
      await service.create('u1');
      const result = await controller.findByUser('u1');
      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should return chat by id', async () => {
      const chat = await service.create('u1');
      const chatId = (chat as any)._id.toString();
      const result = await controller.findById(chatId, 'u1');
      expect(result).toBeDefined();
      expect(result.userId).toBe('u1');
    });
  });
});
