import { Test, TestingModule } from '@nestjs/testing';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { getModelToken } from '@nestjs/mongoose';

describe('SeedController', () => {
  let controller: SeedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeedController],
      providers: [
        SeedService,
        { provide: getModelToken('Producto'), useValue: {} },
        { provide: getModelToken('Rutina'), useValue: {} },
      ],
    }).compile();

    controller = module.get<SeedController>(SeedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
