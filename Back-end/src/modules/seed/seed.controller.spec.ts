jest.mock('../user/entities/user.entity', () => ({
  User: class User {},
  UserSchema: {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

const mockSeedService = {
  seed: jest.fn(),
};

describe('SeedController', () => {
  let controller: SeedController;
  let service: typeof mockSeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeedController],
      providers: [{ provide: SeedService, useValue: mockSeedService }],
    }).compile();

    controller = module.get<SeedController>(SeedController);
    service = module.get(SeedService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('seed()', () => {
    it('calls service.seed and returns success message', async () => {
      service.seed.mockResolvedValue(undefined);

      const result = await controller.seed();

      expect(service.seed).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Datos de prueba insertados correctamente',
      });
    });

    it('propagates errors from service', async () => {
      service.seed.mockRejectedValue(new Error('DB error'));

      await expect(controller.seed()).rejects.toThrow('DB error');
    });
  });
});
