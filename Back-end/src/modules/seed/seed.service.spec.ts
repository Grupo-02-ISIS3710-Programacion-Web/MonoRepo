jest.mock('../user/entities/user.entity', () => ({
  User: class User {},
  UserSchema: {},
}));

jest.mock('bcrypt', () => ({
  hashSync: jest.fn(() => 'hashed-password'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SeedService } from './seed.service';

const createModelMock = () => {
  const modelMock = {
    deleteMany: jest.fn().mockResolvedValue(undefined),
    insertMany: jest.fn().mockResolvedValue([]),
  };
  return modelMock;
};

describe('SeedService', () => {
  let service: SeedService;
  const userModelMock = createModelMock();
  const productoModelMock = createModelMock();
  const rutinaModelMock = createModelMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: getModelToken('User'), useValue: userModelMock },
        { provide: getModelToken('Producto'), useValue: productoModelMock },
        { provide: getModelToken('Rutina'), useValue: rutinaModelMock },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('seed()', () => {
    it('clears and inserts mock data for all collections', async () => {
      await service.seed();

      expect(userModelMock.deleteMany).toHaveBeenCalled();
      expect(userModelMock.insertMany).toHaveBeenCalled();
      expect(productoModelMock.deleteMany).toHaveBeenCalled();
      expect(productoModelMock.insertMany).toHaveBeenCalled();
      expect(rutinaModelMock.deleteMany).toHaveBeenCalled();
      expect(rutinaModelMock.insertMany).toHaveBeenCalled();
    });

    it('hashes passwords before inserting users', async () => {
      await service.seed();

      const usersArg = userModelMock.insertMany.mock.calls[0][0];
      for (const user of usersArg) {
        expect(user.contrasenia).toBe('hashed-password');
      }
    });
  });
});
