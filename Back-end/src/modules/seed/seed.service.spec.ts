import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { getModelToken } from '@nestjs/mongoose';

describe('SeedService', () => {
  let service: SeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: getModelToken('Producto'), useValue: {} },
        { provide: getModelToken('Rutina'), useValue: {} },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
