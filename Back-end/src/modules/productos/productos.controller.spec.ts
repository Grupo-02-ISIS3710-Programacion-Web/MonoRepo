import { Test, TestingModule } from '@nestjs/testing';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { NotFoundException } from '@nestjs/common';

const mockProductosService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByIds: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findCatalogs: jest.fn(),
};

const PRODUCT_ID = '507f1f77bcf86cd799439011';

const mockProduct = {
  id: PRODUCT_ID,
  name: 'Hidratante X',
  brand: 'La Roche-Posay',
  description: 'Crema hidratante',
  skin_type: ['normal', 'seca'],
  product_type: 'cream',
  category: ['hidratacion'],
  ingredients: ['ceramida-3'],
  image_url: ['https://cdn.example.com/img.jpg'],
  rating: 0,
  review_count: 0,
};

const mockCreateDto = {
  name: 'Hidratante X',
  brand: 'La Roche-Posay',
  description: 'Crema hidratante',
  skin_type: ['normal', 'seca'],
  product_type: 'cream',
  primary_category: 'hidratacion',
  additional_categories: [],
  ingredients: ['ceramida-3'],
};

const fakeImages: Express.Multer.File[] = [
  {
    buffer: Buffer.from('img'),
    originalname: 'foto.jpg',
  } as Express.Multer.File,
];

describe('ProductosController', () => {
  let controller: ProductosController;
  let service: typeof mockProductosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductosController],
      providers: [
        { provide: ProductosService, useValue: mockProductosService },
      ],
    }).compile();

    controller = module.get<ProductosController>(ProductosController);
    service = module.get(ProductosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create()', () => {
    it('llama a productosService.create con el DTO y las imágenes', async () => {
      service.create.mockResolvedValue(mockProduct);

      const result = await controller.create(mockCreateDto as any, fakeImages);

      expect(service.create).toHaveBeenCalledWith(mockCreateDto, fakeImages);
      expect(result).toEqual(mockProduct);
    });

    it('propaga errores del servicio', async () => {
      service.create.mockRejectedValue(new Error('Cloudinary error'));

      await expect(
        controller.create(mockCreateDto as any, fakeImages),
      ).rejects.toThrow('Cloudinary error');
    });
  });

  describe('findAll()', () => {
    it('llama a productosService.findAll con includeEmbeddings=false por defecto', async () => {
      service.findAll.mockResolvedValue([mockProduct]);

      const result = await controller.findAll({}, undefined);

      expect(service.findAll).toHaveBeenCalledWith(false);
      expect(result).toEqual([mockProduct]);
    });

    it('pasa includeEmbeddings=true cuando el query param es "true"', async () => {
      service.findAll.mockResolvedValue([mockProduct]);

      await controller.findAll({}, 'true');

      expect(service.findAll).toHaveBeenCalledWith(true);
    });

    it('pasa includeEmbeddings=false cuando el query param es cualquier otro valor', async () => {
      service.findAll.mockResolvedValue([mockProduct]);

      await controller.findAll({}, 'false');

      expect(service.findAll).toHaveBeenCalledWith(false);
    });
  });

  describe('findCatalogs()', () => {
    const mockCatalogs = {
      skin_type: [{ id: 1, code: 'normal', label: 'Normal' }],
      product_type: [{ id: 10, code: 'cream', label: 'Crema' }],
      category: [{ id: 20, code: 'hidratacion', label: 'Hidratación' }],
    };

    it('llama a productosService.findCatalogs con el idioma recibido', async () => {
      service.findCatalogs.mockResolvedValue(mockCatalogs);

      const result = await controller.findCatalogs('es');

      expect(service.findCatalogs).toHaveBeenCalledWith('es');
      expect(result).toEqual(mockCatalogs);
    });

    it('pasa undefined cuando no se envía idioma', async () => {
      service.findCatalogs.mockResolvedValue(mockCatalogs);

      await controller.findCatalogs(undefined);

      expect(service.findCatalogs).toHaveBeenCalledWith(undefined);
    });
  });

  describe('findOne()', () => {
    it('llama a productosService.findOne con el id y includeEmbeddings=false por defecto', async () => {
      service.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(PRODUCT_ID, undefined);

      expect(service.findOne).toHaveBeenCalledWith(PRODUCT_ID, false);
      expect(result).toEqual(mockProduct);
    });

    it('pasa includeEmbeddings=true cuando el query param es "true"', async () => {
      service.findOne.mockResolvedValue({ ...mockProduct, embedding: [0.1] });

      await controller.findOne(PRODUCT_ID, 'true');

      expect(service.findOne).toHaveBeenCalledWith(PRODUCT_ID, true);
    });

    it('propaga NotFoundException si el servicio lanza error', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Producto no encontrado'),
      );

      await expect(
        controller.findOne('id-inexistente', undefined),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    const updateDto = { name: 'Nuevo Nombre' };

    it('llama a productosService.update con id y DTO', async () => {
      const updated = { ...mockProduct, name: 'Nuevo Nombre' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(PRODUCT_ID, updateDto as any);

      expect(service.update).toHaveBeenCalledWith(PRODUCT_ID, updateDto);
      expect(result).toEqual(updated);
    });

    it('propaga errores del servicio', async () => {
      service.update.mockRejectedValue(new Error('DB error'));

      await expect(
        controller.update(PRODUCT_ID, updateDto as any),
      ).rejects.toThrow('DB error');
    });
  });

  describe('remove()', () => {
    it('llama a productosService.remove con el id y retorna el mensaje', async () => {
      const response = {
        message: `Se ha eliminado el producto con id ${PRODUCT_ID}`,
      };
      service.remove.mockResolvedValue(response);

      const result = await controller.remove(PRODUCT_ID);

      expect(service.remove).toHaveBeenCalledWith(PRODUCT_ID);
      expect(result).toEqual(response);
    });
  });

  describe('findBatch()', () => {
    it('llama a productosService.findByIds con el array de IDs', async () => {
      const ids = [PRODUCT_ID, '507f1f77bcf86cd799439012'];
      service.findByIds.mockResolvedValue([mockProduct]);

      const result = await controller.findBatch({ productIds: ids });

      expect(service.findByIds).toHaveBeenCalledWith(ids, undefined);
      expect(result).toEqual([mockProduct]);
    });

    it('retorna array vacío si no hay productos con esos IDs', async () => {
      service.findByIds.mockResolvedValue([]);

      const result = await controller.findBatch({
        productIds: ['id-no-existe'],
      });

      expect(result).toEqual([]);
    });
  });
});
