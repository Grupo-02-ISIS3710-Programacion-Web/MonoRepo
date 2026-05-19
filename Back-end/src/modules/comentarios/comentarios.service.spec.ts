import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';

const createModelMock = () => {
  const mockDocInstance = {
    _id: 'mock-comment-id',
    save: jest.fn().mockResolvedValue(true),
    upvotes: [],
    downvotes: [],
  };

  const modelMock = jest.fn().mockImplementation(() => mockDocInstance);

  Object.assign(modelMock, {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    create: jest.fn(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  });

  return { modelMock, mockDocInstance };
};

const COMMENT_ID = '507f1f77bcf86cd799439011';
const PRODUCT_ID = '607f1f77bcf86cd799439022';
const USER_ID = '707f1f77bcf86cd799439033';

const mockComentario = {
  _id: COMMENT_ID,
  userId: USER_ID,
  productId: PRODUCT_ID,
  comment: 'Muy buen producto',
  upvotes: [],
  downvotes: [],
};

describe('ComentariosService', () => {
  let service: ComentariosService;
  const { modelMock: comentarioModelMock, mockDocInstance } = createModelMock();
  const productoModelMock = {
    findByIdAndUpdate: jest.fn(),
    updateMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComentariosService,
        {
          provide: getModelToken('Comentario'),
          useValue: comentarioModelMock,
        },
        { provide: getModelToken('Producto'), useValue: productoModelMock },
      ],
    }).compile();

    service = module.get<ComentariosService>(ComentariosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create()', () => {
    const createDto = {
      userId: USER_ID,
      productId: PRODUCT_ID,
      comment: 'Muy buen producto',
    };

    it('creates a comentario and pushes to producto', async () => {
      comentarioModelMock.create.mockResolvedValue(mockComentario);

      const result = await service.create(createDto);

      expect(comentarioModelMock.create).toHaveBeenCalled();
      expect(productoModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
        PRODUCT_ID,
        { $push: { comments: mockComentario._id } },
      );
      expect(result).toEqual(mockComentario);
    });
  });

  describe('findAll()', () => {
    it('returns all comentarios', async () => {
      comentarioModelMock.exec.mockResolvedValue([mockComentario]);

      const result = await service.findAll();

      expect(comentarioModelMock.find).toHaveBeenCalled();
      expect(result).toEqual([mockComentario]);
    });
  });

  describe('findOne()', () => {
    it('returns comentario when found', async () => {
      comentarioModelMock.exec.mockResolvedValue(mockComentario);

      const result = await service.findOne(COMMENT_ID);

      expect(comentarioModelMock.findById).toHaveBeenCalledWith(COMMENT_ID);
      expect(result).toEqual(mockComentario);
    });

    it('throws NotFoundException when not found', async () => {
      comentarioModelMock.exec.mockResolvedValue(null);

      await expect(service.findOne(COMMENT_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByProductId()', () => {
    it('returns comentarios for a product', async () => {
      comentarioModelMock.exec.mockResolvedValue([mockComentario]);

      const result = await service.findByProductId(PRODUCT_ID);

      expect(comentarioModelMock.find).toHaveBeenCalled();
      expect(comentarioModelMock.populate).toHaveBeenCalledWith(
        'userId',
        'nombre avatarUrl',
      );
      expect(comentarioModelMock.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual([mockComentario]);
    });
  });

  describe('update()', () => {
    const updateDto = { comment: 'Updated comment' };

    it('updates and returns comentario when found', async () => {
      const updated = { ...mockComentario, ...updateDto };
      comentarioModelMock.exec.mockResolvedValue(updated);

      const result = await service.update(COMMENT_ID, updateDto);

      expect(comentarioModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
        COMMENT_ID,
        updateDto,
        { new: true },
      );
      expect(result).toEqual(updated);
    });

    it('throws NotFoundException when not found', async () => {
      comentarioModelMock.exec.mockResolvedValue(null);

      await expect(
        service.update(COMMENT_ID, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('deletes and pulls from producto when found', async () => {
      comentarioModelMock.exec.mockResolvedValue(mockComentario);

      const result = await service.remove(COMMENT_ID);

      expect(comentarioModelMock.findByIdAndDelete).toHaveBeenCalledWith(
        COMMENT_ID,
      );
      expect(productoModelMock.updateMany).toHaveBeenCalled();
      expect(result).toEqual(mockComentario);
    });

    it('throws NotFoundException when not found', async () => {
      comentarioModelMock.exec.mockResolvedValue(null);

      await expect(service.remove(COMMENT_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('upvote()', () => {
    it('adds upvote when user has not voted', async () => {
      const comment = {
        ...mockComentario,
        upvotes: [],
        downvotes: [],
        save: jest.fn().mockResolvedValue(true),
      };
      comentarioModelMock.exec.mockResolvedValue(comment);

      const result = await service.upvote(COMMENT_ID, 'user-456');

      expect(comment.upvotes).toContain('user-456');
      expect(comment.save).toHaveBeenCalled();
    });

    it('returns comment unchanged if user already upvoted', async () => {
      const comment = {
        ...mockComentario,
        upvotes: ['user-456'],
        downvotes: [],
        save: jest.fn(),
      };
      comentarioModelMock.exec.mockResolvedValue(comment);

      const result = await service.upvote(COMMENT_ID, 'user-456');

      expect(result.upvotes).toEqual(['user-456']);
      expect(comment.save).not.toHaveBeenCalled();
    });

    it('removes downvote when user upvotes after downvoting', async () => {
      const comment = {
        ...mockComentario,
        upvotes: [],
        downvotes: ['user-456'],
        save: jest.fn().mockResolvedValue(true),
      };
      comentarioModelMock.exec.mockResolvedValue(comment);

      const result = await service.upvote(COMMENT_ID, 'user-456');

      expect(result.downvotes).not.toContain('user-456');
      expect(result.upvotes).toContain('user-456');
      expect(comment.save).toHaveBeenCalled();
    });

    it('throws NotFoundException when comentario not found', async () => {
      comentarioModelMock.exec.mockResolvedValue(null);

      await expect(
        service.upvote(COMMENT_ID, 'user-456'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
