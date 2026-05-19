import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RutinasService } from './rutinas.service';

const createMockDoc = (overrides: Record<string, any> = {}) => {
  const doc: Record<string, any> = {
    _id: 'rutina-1',
    userId: 'u1',
    name: 'Test Routine',
    description: 'Description',
    type: 'am',
    skinType: 'mixta',
    steps: [],
    views: 0,
    upvotes: [],
    downvotes: [],
    deleted: false,
    publishedAt: new Date().toISOString(),
    save: jest.fn(),
    ...overrides,
  };
  doc.save.mockResolvedValue(doc);
  return doc;
};

describe('RutinasService', () => {
  let service: RutinasService;
  let rutinaModel: jest.Mocked<any>;

  beforeEach(async () => {
    const mockDoc = createMockDoc();

    rutinaModel = Object.assign(jest.fn().mockImplementation(() => mockDoc), {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RutinasService,
        { provide: getModelToken('Rutina'), useValue: rutinaModel },
      ],
    }).compile();

    service = module.get<RutinasService>(RutinasService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a routine', async () => {
      const dto = { userId: 'u1', name: 'Test Routine', description: 'Desc', type: 'am', skinType: 'mixta', steps: [] };
      const savedDoc = createMockDoc({ name: 'Test Routine', userId: 'u1' });
      rutinaModel.mockImplementation(() => savedDoc);

      const result = await service.create(dto as any);
      expect(result.name).toBe('Test Routine');
      expect(result.userId).toBe('u1');
      expect(savedDoc.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should list routines with pagination (newest default)', async () => {
      const routines = [createMockDoc({ _id: 'r1' }), createMockDoc({ _id: 'r2' })];
      rutinaModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(routines) }),
          }),
        }),
      });
      rutinaModel.countDocuments.mockResolvedValue(2);

      const result = await service.findAll();
      expect(result.routines).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });
  });

  describe('findByUserId', () => {
    it('should get routines by user id', async () => {
      const routines = [createMockDoc(), createMockDoc({ _id: 'r2' })];
      rutinaModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(routines) }),
          }),
        }),
      });
      rutinaModel.countDocuments.mockResolvedValue(2);

      const result = await service.findByUserId('u1');
      expect(result.routines).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should get a routine by id', async () => {
      const doc = createMockDoc({ name: 'Rutina de prueba', userId: 'u1' });
      rutinaModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      const result = await service.findOne('rutina-1');
      expect(result).toBeDefined();
      expect(result.name).toBe('Rutina de prueba');
    });

    it('should return null for non-existent routine id', async () => {
      rutinaModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await service.findOne('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a routine', async () => {
      const updated = createMockDoc({ name: 'Nombre actualizado' });
      rutinaModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updated) });

      const result = await service.update('rutina-1', { name: 'Nombre actualizado' } as any);
      expect(result.name).toBe('Nombre actualizado');
    });
  });

  describe('softDelete', () => {
    it('should soft delete a routine', async () => {
      const deleted = createMockDoc({ deleted: true });
      rutinaModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(deleted) });

      const result = await service.softDelete('rutina-1');
      expect(result.deleted).toBe(true);
    });
  });

  describe('hardDelete', () => {
    it('should hard delete a routine permanently', async () => {
      const doc = createMockDoc();
      rutinaModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      const result = await service.hardDelete('rutina-1');
      expect(result).toBeDefined();
    });
  });

  describe('upvote', () => {
    it('should add upvote to routine', async () => {
      const doc = createMockDoc({ upvotes: [], downvotes: [], save: jest.fn().mockResolvedValue(true) });
      rutinaModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      const result = await service.upvote('rutina-1', 'u2');
      expect(result.upvotes).toContain('u2');
      expect(result.save).toHaveBeenCalled();
    });

    it('should remove upvote if user upvotes again', async () => {
      const doc = createMockDoc({ upvotes: ['u2'], downvotes: [], save: jest.fn().mockResolvedValue(true) });
      rutinaModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      const result = await service.upvote('rutina-1', 'u2');
      expect(result.upvotes).not.toContain('u2');
    });
  });

  describe('downvote', () => {
    it('should add downvote to routine', async () => {
      const doc = createMockDoc({ upvotes: [], downvotes: [], save: jest.fn().mockResolvedValue(true) });
      rutinaModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      const result = await service.downvote('rutina-1', 'u3');
      expect(result.downvotes).toContain('u3');
      expect(result.save).toHaveBeenCalled();
    });
  });

  describe('removeUpvote', () => {
    it('should remove upvote', async () => {
      const doc = createMockDoc({ upvotes: ['u2'], downvotes: [], save: jest.fn().mockResolvedValue(true) });
      rutinaModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      const result = await service.removeUpvote('rutina-1', 'u2');
      expect(result.upvotes).not.toContain('u2');
    });
  });

  describe('removeDownvote', () => {
    it('should remove downvote', async () => {
      const doc = createMockDoc({ upvotes: [], downvotes: ['u3'], save: jest.fn().mockResolvedValue(true) });
      rutinaModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      const result = await service.removeDownvote('rutina-1', 'u3');
      expect(result.downvotes).not.toContain('u3');
    });
  });

  describe('incrementView', () => {
    it('should increment view count', async () => {
      const doc = createMockDoc({ views: 1 });
      rutinaModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      const result = await service.incrementView('rutina-1');
      expect(result.views).toBe(1);
    });
  });

  describe('getVoteCounts', () => {
    it('should get vote and view counts', async () => {
      const doc = createMockDoc({ upvotes: ['u2'], downvotes: ['u3'], views: 1 });
      rutinaModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      const counts = await service.getVoteCounts('rutina-1');
      expect(counts.upvotes).toBe(1);
      expect(counts.downvotes).toBe(1);
      expect(counts.views).toBe(1);
    });
  });
});
