import { Test, TestingModule } from '@nestjs/testing';
import { ProductosService } from './productos.service';
import { getModelToken } from '@nestjs/mongoose';

describe('ProductosService', () => {
  let service: ProductosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        { provide: getModelToken('Producto'), useValue: {} },
        { provide: getModelToken('SkinTypeCatalog'), useValue: {} },
        { provide: getModelToken('ProductTypeCatalog'), useValue: {} },
        { provide: getModelToken('CategoryCatalog'), useValue: {} },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
