import { Test, TestingModule } from '@nestjs/testing';
import { ComentariosController } from './comentarios.controller';
import { ComentariosService } from './comentarios.service';
import { NotFoundException } from '@nestjs/common';

const mockComentariosService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  upvote: jest.fn(),
  findByProductId: jest.fn(),
};

const COMMENT_ID = '507f1f77bcf86cd799439011';
const PRODUCT_ID = '607f1f77bcf86cd799439011';

const mockComentario = {
  _id: COMMENT_ID,
  userId: 'user-123',
  productId: PRODUCT_ID,
  comment: 'Muy buen producto',
  upvotes: [],
  downvotes: [],
};

describe('ComentariosController', () => {
  let controller: ComentariosController;
  let service: typeof mockComentariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComentariosController],
      providers: [
        { provide: ComentariosService, useValue: mockComentariosService },
      ],
    }).compile();

    controller = module.get<ComentariosController>(ComentariosController);
    service = module.get(ComentariosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create()', () => {
    const createDto = {
      userId: 'user-123',
      productId: PRODUCT_ID,
      comment: 'Muy buen producto',
    };

    it('calls service.create with DTO', async () => {
      service.create.mockResolvedValue(mockComentario);

      const result = await controller.create(createDto as any);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockComentario);
    });
  });

  describe('findAll()', () => {
    it('returns all comentarios', async () => {
      service.findAll.mockResolvedValue([mockComentario]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockComentario]);
    });
  });

  describe('findOne()', () => {
    it('calls service.findOne with id', async () => {
      service.findOne.mockResolvedValue(mockComentario);

      const result = await controller.findOne(COMMENT_ID);

      expect(service.findOne).toHaveBeenCalledWith(COMMENT_ID);
      expect(result).toEqual(mockComentario);
    });

    it('propagates NotFoundException', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException(`Comentario ${COMMENT_ID} not found`),
      );

      await expect(controller.findOne(COMMENT_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    const updateDto = { comment: 'Comentario actualizado' };

    it('calls service.update with id and DTO', async () => {
      const updated = { ...mockComentario, comment: 'Comentario actualizado' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(COMMENT_ID, updateDto as any);

      expect(service.update).toHaveBeenCalledWith(COMMENT_ID, updateDto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove()', () => {
    it('calls service.remove with id', async () => {
      service.remove.mockResolvedValue(mockComentario);

      const result = await controller.remove(COMMENT_ID);

      expect(service.remove).toHaveBeenCalledWith(COMMENT_ID);
      expect(result).toEqual(mockComentario);
    });
  });

  describe('upvote()', () => {
    it('calls service.upvote with comment id and user id', async () => {
      const upvoted = {
        ...mockComentario,
        upvotes: ['user-456'],
      };
      service.upvote.mockResolvedValue(upvoted);

      const result = await controller.upvote(COMMENT_ID, 'user-456');

      expect(service.upvote).toHaveBeenCalledWith(COMMENT_ID, 'user-456');
      expect(result).toEqual(upvoted);
    });
  });

  describe('findByProductId()', () => {
    it('calls service.findByProductId with productId', async () => {
      service.findByProductId.mockResolvedValue([mockComentario]);

      const result = await controller.findByProductId(PRODUCT_ID);

      expect(service.findByProductId).toHaveBeenCalledWith(PRODUCT_ID);
      expect(result).toEqual([mockComentario]);
    });
  });
});
