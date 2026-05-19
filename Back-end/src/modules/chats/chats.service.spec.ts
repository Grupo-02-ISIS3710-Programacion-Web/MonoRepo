import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ChatsService } from './chats.service';
import { NotFoundException } from '@nestjs/common';

const createMockDoc = (overrides = {}) => {
  const doc: Record<string, any> = {
    _id: 'chat-1',
    userId: 'u1',
    messages: [],
    selectedFocusAreaIds: [],
    routineDraft: undefined,
    deleted: false,
    save: jest.fn(),
    ...overrides,
  };
  doc.save.mockResolvedValue(doc);
  return doc;
};

describe('ChatsService', () => {
  let service: ChatsService;
  let chatModel: jest.Mocked<any>;

  beforeEach(async () => {
    const mockDoc = createMockDoc();

    chatModel = Object.assign(jest.fn().mockImplementation(() => mockDoc), {
      findOne: jest.fn(),
      find: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        { provide: getModelToken('Chat'), useValue: chatModel },
      ],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a chat without focus areas', async () => {
      const mockDoc = createMockDoc({ save: jest.fn().mockResolvedValue(createMockDoc()) });
      chatModel.mockImplementation(() => mockDoc);

      const result = await service.create('u1');
      expect(result).toBeDefined();
      expect(result.userId).toBe('u1');
      expect(mockDoc.save).toHaveBeenCalled();
    });

    it('should create a chat with focus areas', async () => {
      const expectedDoc = createMockDoc({
        selectedFocusAreaIds: ['fa1', 'fa2'],
        save: jest.fn().mockResolvedValue(true),
      });
      chatModel.mockImplementation(() => expectedDoc);

      const result = await service.create('u1', ['fa1', 'fa2']);
      expect(result.selectedFocusAreaIds).toEqual(['fa1', 'fa2']);
    });
  });

  describe('findById', () => {
    it('should return chat by id for correct user', async () => {
      const chatDoc = createMockDoc({ _id: 'chat-1', userId: 'u1' });
      chatModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(chatDoc) });

      const result = await service.findById('chat-1', 'u1');
      expect(result).toBeDefined();
      expect(result.userId).toBe('u1');
    });

    it('should throw NotFoundException for wrong user', async () => {
      chatModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.findById('chat-1', 'u2')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for deleted chat', async () => {
      chatModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.findById('chat-1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('should return all chats for user', async () => {
      const chats = [createMockDoc(), createMockDoc({ _id: 'chat-2' })];
      chatModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(chats) }),
      });

      const result = await service.findByUser('u1');
      expect(result).toHaveLength(2);
    });
  });

  describe('saveMessage', () => {
    it('should save a user message', async () => {
      const chatDoc = createMockDoc({ messages: [], save: jest.fn().mockResolvedValue(true) });
      chatModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(chatDoc) });

      await service.saveMessage('chat-1', 'u1', { role: 'user', content: 'Hola' });
      expect(chatDoc.messages).toHaveLength(1);
      expect(chatDoc.messages[0].role).toBe('user');
      expect(chatDoc.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for wrong user', async () => {
      chatModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.saveMessage('chat-1', 'u2', { role: 'user', content: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateDraft', () => {
    it('should create draft if not exists', async () => {
      const chatDoc = createMockDoc({ routineDraft: undefined, save: jest.fn().mockResolvedValue(true) });
      chatModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(chatDoc) });

      await service.updateDraft('chat-1', 'u1', { name: 'Mi Rutina' });
      expect(chatDoc.routineDraft).toBeDefined();
      expect(chatDoc.routineDraft.name).toBe('Mi Rutina');
      expect(chatDoc.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for wrong user', async () => {
      chatModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.updateDraft('chat-1', 'u2', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateFocusAreas', () => {
    it('should update focus areas', async () => {
      const chatDoc = createMockDoc({ save: jest.fn().mockResolvedValue(true) });
      chatModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(chatDoc) });

      await service.updateFocusAreas('chat-1', 'u1', ['fa2', 'fa3']);
      expect(chatDoc.selectedFocusAreaIds).toEqual(['fa2', 'fa3']);
      expect(chatDoc.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for wrong user', async () => {
      chatModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.updateFocusAreas('chat-1', 'u2', ['fa2']),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
