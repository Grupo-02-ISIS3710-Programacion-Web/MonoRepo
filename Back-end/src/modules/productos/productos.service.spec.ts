import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { AiService } from '../ai/ai.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

/** Crea un mock de Model de Mongoose con todos los métodos encadenables */
const createModelMock = (docOverrides: Record<string, unknown> = {}) => {
  // Instancia mockeada que devuelve `save()`
  const mockDocInstance = {
    _id: 'mock-id-123',
    save: jest.fn(),
    ...docOverrides,
  };

  const modelMock = jest.fn().mockImplementation(() => mockDocInstance);

  // Métodos estáticos del modelo
  Object.assign(modelMock, {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    updateOne: jest.fn().mockReturnThis(),
    countDocuments: jest.fn().mockReturnThis(),
    exists: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  });

  return { modelMock, mockDocInstance };
};

// Mock de enums/getCatalogIdByCode
jest.mock('../../enums/enums', () => ({
  SKIN_TYPE_CATALOG: [],
  PRODUCT_TYPE_CATALOG: [],
  CATEGORY_CATALOG: [],
  getCatalogIdByCode: jest.fn((type: string, code: string) => {
    const map: Record<string, number> = {
      'skin_type:normal': 1,
      'skin_type:seca': 2,
      'product_type:cream': 10,
      'category:hidratacion': 20,
      'category:reparacion': 21,
    };
    return map[`${type}:${code}`] ?? 99;
  }),
  CatalogLanguage: {},
}));

describe('ProductosService', () => {
  let service: ProductosService;

  // Mocks de modelos
  const { modelMock: productoModelMock, mockDocInstance } = createModelMock();
  const { modelMock: skinTypeModelMock } = createModelMock();
  const { modelMock: productTypeModelMock } = createModelMock();
  const { modelMock: categoryModelMock } = createModelMock();

  // Mocks de servicios externos
  const mockAiService = {
    generateProductEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
  };

  const mockCloudinaryService = {
    uploadBuffer: jest
      .fn()
      .mockResolvedValue('https://cdn.example.com/img.jpg'),
  };

  beforeEach(async () => {
    // Evitar que onModuleInit haga seed real
    jest.spyOn(ProductosService.prototype, 'onModuleInit').mockResolvedValue();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        { provide: getModelToken('Producto'), useValue: productoModelMock },
        {
          provide: getModelToken('SkinTypeCatalog'),
          useValue: skinTypeModelMock,
        },
        {
          provide: getModelToken('ProductTypeCatalog'),
          useValue: productTypeModelMock,
        },
        {
          provide: getModelToken('CategoryCatalog'),
          useValue: categoryModelMock,
        },
        { provide: AiService, useValue: mockAiService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create()', () => {
    const dto = {
      name: 'Hidratante X',
      brand: 'La Roche-Posay',
      description: 'Crema hidratante',
      skin_type: ['normal', 'seca'],
      product_type: 'cream',
      primary_category: 'hidratacion',
      additional_categories: ['reparacion'],
      ingredients: ['ceramida-3', 'niacinamida'],
    };

    const fakeImages: Express.Multer.File[] = [
      {
        buffer: Buffer.from('img'),
        originalname: 'foto.jpg',
      } as Express.Multer.File,
    ];

    it('lanza BadRequestException si no se envían imágenes', async () => {
      await expect(service.create(dto, [])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('sube imágenes a Cloudinary y guarda el producto', async () => {
      // Mocks de validación de catálogos
      skinTypeModelMock.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });
      productTypeModelMock.exists.mockReturnValue({
        exec: jest.fn().mockResolvedValue(true),
      });
      categoryModelMock.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const savedProduct = { _id: 'abc123', ...dto };
      mockDocInstance.save.mockResolvedValue(savedProduct);

      productoModelMock.findByIdAndUpdate.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...savedProduct, embedding: [0.1] }),
      });

      const result = await service.create(dto, fakeImages);

      expect(mockCloudinaryService.uploadBuffer).toHaveBeenCalledTimes(1);
      expect(mockDocInstance.save).toHaveBeenCalled();
      expect(mockAiService.generateProductEmbedding).toHaveBeenCalled();
      expect(result).toHaveProperty('embedding');
    });

    it('retorna el producto sin embedding si falla el servicio de IA', async () => {
      skinTypeModelMock.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });
      productTypeModelMock.exists.mockReturnValue({
        exec: jest.fn().mockResolvedValue(true),
      });
      categoryModelMock.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const savedProduct = { _id: 'abc123', ...dto };
      mockDocInstance.save.mockResolvedValue(savedProduct);
      mockAiService.generateProductEmbedding.mockRejectedValue(
        new Error('AI down'),
      );

      const result = await service.create(dto, fakeImages);

      expect(result).toEqual(savedProduct);
    });
  });

  describe('findAll()', () => {
    it('retorna lista de productos normalizados sin embeddings por defecto', async () => {
      const rawProducts = [
        {
          _id: 'p1',
          name: 'Prod A',
          brand: 'Brand',
          description: 'Desc',
          skin_type: [1],
          product_type: 10,
          category: [20],
          ingredients: [],
          image_url: [],
          rating: 4,
          review_count: 10,
        },
      ];

      productoModelMock.find.mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue(rawProducts) }),
      });

      skinTypeModelMock.find.mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValue([{ _id: 1, code: 'normal' }]),
        }),
      });
      productTypeModelMock.find.mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValue([{ _id: 10, code: 'cream' }]),
        }),
      });
      categoryModelMock.find.mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValue([{ _id: 20, code: 'hidratacion' }]),
        }),
      });

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');
      expect(result[0].skin_type).toEqual(['normal']);
      expect(result[0].product_type).toBe('cream');
      expect(result[0].category).toEqual(['hidratacion']);
    });

    it('retorna array vacío si no hay productos', async () => {
      productoModelMock.find.mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue([]) }),
      });

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne()', () => {
    it('retorna el producto si existe y no está eliminado', async () => {
      const rawProduct = { _id: 'abc', name: 'Prod A', deleted: false };

      productoModelMock.findById.mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue(rawProduct) }),
      });

      skinTypeModelMock.find.mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue([]) }),
      });
      productTypeModelMock.find.mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue([]) }),
      });
      categoryModelMock.find.mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue([]) }),
      });

      const result = await service.findOne('abc');
      expect(result).toEqual({
        id: 'abc',
        name: 'Prod A',
        brand: undefined,
        description: undefined,
        skin_type: [],
        product_type: undefined,
        category: [],
        ingredients: [],
        image_url: [],
        rating: 0,
        review_count: 0,
      });
    });

    it('lanza NotFoundException si el producto no existe', async () => {
      productoModelMock.findById.mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue(null) }),
      });

      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza NotFoundException si el producto está eliminado (soft delete)', async () => {
      productoModelMock.findById.mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValue({ _id: 'abc', deleted: true }),
        }),
      });

      await expect(service.findOne('abc')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByIds()', () => {
    it('retorna array vacío si se pasa lista vacía', async () => {
      const result = await service.findByIds([]);
      expect(result).toEqual([]);
    });

    it('busca productos por IDs y los normaliza', async () => {
      const rawProducts = [
        {
          _id: 'p1',
          name: 'Prod A',
          brand: 'Brand',
          description: 'Desc',
          skin_type: [],
          product_type: 10,
          category: [],
          ingredients: [],
          image_url: [],
          rating: 0,
          review_count: 0,
        },
      ];

      productoModelMock.find.mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue(rawProducts) }),
      });

      skinTypeModelMock.find.mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue([]) }),
      });
      productTypeModelMock.find.mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValue([{ _id: 10, code: 'cream' }]),
        }),
      });
      categoryModelMock.find.mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue([]) }),
      });

      const result = await service.findByIds(['p1']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');
    });
  });

  describe('update()', () => {
    it('actualiza campos básicos y regenera embedding', async () => {
      const updatedProduct = {
        _id: 'abc',
        name: 'Nuevo Nombre',
        embedding: [0.5],
      };

      productoModelMock.findByIdAndUpdate
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(updatedProduct),
        })
        .mockReturnValueOnce({
          exec: jest
            .fn()
            .mockResolvedValue({ ...updatedProduct, embedding: [0.1] }),
        });

      const result = await service.update('abc', { name: 'Nuevo Nombre' });

      expect(productoModelMock.findByIdAndUpdate).toHaveBeenCalled();
      expect(mockAiService.generateProductEmbedding).toHaveBeenCalled();
      expect(result).toHaveProperty('embedding');
    });

    it('valida catálogos si se actualizan campos de catálogo', async () => {
      skinTypeModelMock.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });
      productTypeModelMock.exists.mockReturnValue({
        exec: jest.fn().mockResolvedValue(true),
      });
      categoryModelMock.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      productoModelMock.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'abc', skin_type: [1] }),
      });

      await expect(
        service.update('abc', {
          skin_type: ['normal'],
          product_type: 'cream',
          primary_category: 'hidratacion',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('remove()', () => {
    it('hace soft delete y retorna mensaje de éxito', async () => {
      productoModelMock.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'abc', deleted: true }),
      });

      const result = await service.remove('abc');
      expect(result.message).toContain('abc');
      expect(productoModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
        'abc',
        { deleted: true },
        { new: true },
      );
    });

    it('retorna mensaje de "no encontrado" si el id no existe', async () => {
      productoModelMock.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.remove('id-inexistente');
      expect(result.message).toContain('No se encontró');
    });
  });

  describe('findCatalogs()', () => {
    const mockCatalogData = [
      { _id: 1, code: 'normal', labels: { es: 'Normal', en: 'Normal' } },
    ];

    beforeEach(() => {
      skinTypeModelMock.find.mockReturnValue({
        sort: () => ({
          lean: () => ({ exec: jest.fn().mockResolvedValue(mockCatalogData) }),
        }),
      });
      productTypeModelMock.find.mockReturnValue({
        sort: () => ({
          lean: () => ({ exec: jest.fn().mockResolvedValue(mockCatalogData) }),
        }),
      });
      categoryModelMock.find.mockReturnValue({
        sort: () => ({
          lean: () => ({ exec: jest.fn().mockResolvedValue(mockCatalogData) }),
        }),
      });
    });

    it('retorna catálogos en español por defecto', async () => {
      const result = await service.findCatalogs('es');

      expect(result).toHaveProperty('skin_type');
      expect(result).toHaveProperty('product_type');
      expect(result).toHaveProperty('category');
      expect(result.skin_type[0].label).toBe('Normal');
    });

    it('retorna catálogos en inglés cuando se solicita', async () => {
      const result = await service.findCatalogs('en');
      expect(result.skin_type[0].label).toBe('Normal');
    });
  });
});
