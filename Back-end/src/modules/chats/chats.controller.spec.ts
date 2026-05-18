import { Test, TestingModule } from '@nestjs/testing';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';

const mockChatsService = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUser: jest.fn(),
  saveMessage: jest.fn(),
  updateDraft: jest.fn(),
  updateFocusAreas: jest.fn(),
};

describe('ChatsController', () => {
  let controller: ChatsController;
  let service: typeof mockChatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [{ provide: ChatsService, useValue: mockChatsService }],
    }).compile();

    controller = module.get<ChatsController>(ChatsController);
    service = module.get(ChatsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a chat', async () => {
      service.create.mockResolvedValue({ id: 'chat-1' });

      const result = await controller.create({ userId: 'u1', selectedFocusAreaIds: ['fa1'] });
      expect(result).toHaveProperty('chatId', 'chat-1');
      expect(service.create).toHaveBeenCalledWith('u1', ['fa1']);
    });
  });

  describe('findByUser', () => {
    it('should return user chats', async () => {
      service.findByUser.mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]);

      const result = await controller.findByUser('u1');
      expect(result).toHaveLength(2);
      expect(service.findByUser).toHaveBeenCalledWith('u1');
    });

    it('should throw if userId is missing', async () => {
      await expect(controller.findByUser(undefined as any)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should return chat by id', async () => {
      const mockChat = { id: 'chat-1', userId: 'u1' };
      service.findById.mockResolvedValue(mockChat);

      const result = await controller.findById('chat-1', 'u1');
      expect(result).toBeDefined();
      expect(result.userId).toBe('u1');
    });

    it('should throw if userId is missing', async () => {
      await expect(controller.findById('chat-1', undefined as any)).rejects.toThrow();
    });
  });
});
