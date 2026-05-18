import { Test, TestingModule } from '@nestjs/testing';
import { RutinasController } from './rutinas.controller';
import { RutinasService } from './rutinas.service';

const mockRutinasService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByUserId: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  hardDelete: jest.fn(),
  upvote: jest.fn(),
  downvote: jest.fn(),
  removeUpvote: jest.fn(),
  removeDownvote: jest.fn(),
  incrementView: jest.fn(),
  getVoteCounts: jest.fn(),
};

describe('RutinasController', () => {
  let controller: RutinasController;
  let service: typeof mockRutinasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RutinasController],
      providers: [{ provide: RutinasService, useValue: mockRutinasService }],
    }).compile();

    controller = module.get<RutinasController>(RutinasController);
    service = module.get(RutinasService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create routine via controller', async () => {
      const dto = { userId: 'u1', name: 'Rutina controlador', description: 'Test', type: 'am', skinType: 'mixta', steps: [] };
      service.create.mockResolvedValue({ ...dto, _id: 'r1' });

      const result = await controller.create(dto as any);
      expect(result.name).toBe('Rutina controlador');
      expect(result.userId).toBe('u1');
    });
  });

  describe('findAll', () => {
    it('should list routines via controller', async () => {
      service.findAll.mockResolvedValue({ routines: [{ _id: 'r1' }, { _id: 'r2' }], total: 2, page: 1, pageSize: 20, totalPages: 1 });

      const result = await controller.findAll();
      expect(result.routines).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('findByUserId', () => {
    it('should get routines by user id via controller', async () => {
      service.findByUserId.mockResolvedValue({ routines: [{ _id: 'r1' }, { _id: 'r2' }], total: 2, page: 1, pageSize: 20, totalPages: 1 });

      const result = await controller.findByUserId('u1');
      expect(result.routines).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should get routine by id via controller', async () => {
      const mockRutina = { _id: 'r1', name: 'Buscar por ID', userId: 'u1' };
      service.findOne.mockResolvedValue(mockRutina);

      const result = await controller.findOne('r1');
      expect(result.name).toBe('Buscar por ID');
    });
  });

  describe('update', () => {
    it('should update routine via controller', async () => {
      const updated = { _id: 'r1', name: 'Nombre después' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update('r1', { name: 'Nombre después' } as any);
      expect(result.name).toBe('Nombre después');
    });
  });

  describe('softDelete', () => {
    it('should soft delete routine via controller', async () => {
      const deleted = { _id: 'r1', deleted: true };
      service.softDelete.mockResolvedValue(deleted);

      const result = await controller.softDelete('r1');
      expect(result.deleted).toBe(true);
    });
  });

  describe('hardDelete', () => {
    it('should hard delete routine via controller', async () => {
      service.hardDelete.mockResolvedValue({ _id: 'r1' });
      service.findOne.mockResolvedValue(null);

      await controller.hardDelete('r1');
      const found = await controller.findOne('r1');
      expect(found).toBeNull();
    });
  });

  describe('upvote', () => {
    it('should upvote via controller', async () => {
      const updated = { _id: 'r1', upvotes: ['u2'] };
      service.upvote.mockResolvedValue(updated);

      const result = await controller.upvote('r1', 'u2');
      expect(result.upvotes).toContain('u2');
    });
  });

  describe('downvote', () => {
    it('should downvote via controller', async () => {
      const updated = { _id: 'r1', downvotes: ['u3'] };
      service.downvote.mockResolvedValue(updated);

      const result = await controller.downvote('r1', 'u3');
      expect(result.downvotes).toContain('u3');
    });
  });

  describe('removeUpvote', () => {
    it('should remove upvote via controller', async () => {
      const updated = { _id: 'r1', upvotes: [] };
      service.removeUpvote.mockResolvedValue(updated);

      const result = await controller.removeUpvote('r1', 'u2');
      expect(result.upvotes).not.toContain('u2');
    });
  });

  describe('removeDownvote', () => {
    it('should remove downvote via controller', async () => {
      const updated = { _id: 'r1', downvotes: [] };
      service.removeDownvote.mockResolvedValue(updated);

      const result = await controller.removeDownvote('r1', 'u3');
      expect(result.downvotes).not.toContain('u3');
    });
  });

  describe('incrementView', () => {
    it('should increment views via controller', async () => {
      const updated = { _id: 'r1', views: 1 };
      service.incrementView.mockResolvedValue(updated);

      const result = await controller.incrementView('r1');
      expect(result.views).toBe(1);
    });
  });

  describe('getVoteCounts', () => {
    it('should get vote counts via controller', async () => {
      service.getVoteCounts.mockResolvedValue({ upvotes: 1, downvotes: 1, views: 1 });

      const counts = await controller.getVoteCounts('r1');
      expect(counts.upvotes).toBe(1);
      expect(counts.downvotes).toBe(1);
      expect(counts.views).toBe(1);
    });
  });
});
