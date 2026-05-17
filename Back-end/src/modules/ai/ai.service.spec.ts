import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';

// Mocks
const mockChatModel = {
  invoke: jest.fn(),
};

const mockEmbeddings = {
  embedQuery: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'COHERE_API_KEY') return 'test-api-key';
    return null;
  }),
};

describe('AiService (pruebas completas)', () => {
  let service: AiService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getModelToken('Rutina'), useValue: {} },
        { provide: getModelToken('Producto'), useValue: {} },
        { provide: getModelToken('SkinTypeCatalog'), useValue: {} },
        { provide: getModelToken('ProductTypeCatalog'), useValue: {} },
        { provide: getModelToken('CategoryCatalog'), useValue: {} },
      ],
    }).compile();

    service = module.get<AiService>(AiService);

    // Inyectar mocks
    (service as any).chatModel = mockChatModel;
    (service as any).embeddings = mockEmbeddings;

    // Configurar availableProducts
    (service as any).availableProducts = [
      { id: 'prod1', name: 'Limpiador', skin_type: ['mixta'] },
      { id: 'prod2', name: 'Hidratante', skin_type: ['seca'] },
    ];

    // Mockear loadAvailableProducts para evitar consulta a BD
    jest
      .spyOn(service as any, 'loadAvailableProducts')
      .mockImplementation(async () => {
        // Ya configurado arriba en availableProducts
      });

    // Mockear loadCatalogCodes
    jest
      .spyOn(service as any, 'loadCatalogCodes')
      .mockResolvedValue(['code1', 'code2']);

    // Mockear generateEmbeddingText
    jest
      .spyOn(service as any, 'generateEmbeddingText')
      .mockResolvedValue('texto de prueba');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate routine with valid JSON', async () => {
    const mockResponse = {
      content: JSON.stringify({
        name: 'Rutina Test',
        description: 'Descripción',
        steps: [{ name: 'Paso 1', productId: 'prod1', notes: '' }],
      }),
    };
    mockChatModel.invoke.mockResolvedValue(mockResponse);

    const result = await service.generateRoutine({
      userId: 'u1',
      skinType: 'mixta',
      type: 'am',
    });

    expect(result).toBeDefined();
    expect(result.name).toBe('Rutina Test');
    expect(result.steps.length).toBeGreaterThan(0);
  });

  it('should throw error with invalid JSON', async () => {
    mockChatModel.invoke.mockResolvedValue({ content: 'invalid json' });

    await expect(
      service.generateRoutine({
        userId: 'u1',
        skinType: 'mixta',
        type: 'am',
      }),
    ).rejects.toThrow();
  });

  it('should suggest products', async () => {
    const mockResponse = {
      content: JSON.stringify({
        suggestions: [{ productId: 'prod1', reason: 'Bueno' }],
      }),
    };
    mockChatModel.invoke.mockResolvedValue(mockResponse);

    const result = await service.suggestProducts({
      skinType: 'mixta',
      stepName: 'Limpieza',
    });

    expect(result).toBeDefined();
    expect(result.suggestions).toBeDefined();
  });

  it('should return empty suggestions on error', async () => {
    mockChatModel.invoke.mockRejectedValue(new Error('API Error'));

    const result = await service.suggestProducts({
      skinType: 'mixta',
      stepName: 'Limpieza',
    });

    expect(result.suggestions).toEqual([]);
  });

  it('should chat with AI', async () => {
    const mockResponse = {
      content: JSON.stringify({
        message: 'Hola',
        recommendedProducts: [{ productId: 'prod1', reason: 'Bueno' }],
      }),
    };
    mockChatModel.invoke.mockResolvedValue(mockResponse);

    const result = await service.chatWithAI({
      userId: 'u1',
      messages: [{ role: 'user', content: 'Hola' }],
    });

    expect(result).toBeDefined();
    expect(result.response).toBe('Hola');
  });

  it('should handle non-JSON chat response', async () => {
    mockChatModel.invoke.mockResolvedValue({ content: 'Texto plano' });

    const result = await service.chatWithAI({
      userId: 'u1',
      messages: [{ role: 'user', content: 'Hola' }],
    });

    expect(result).toBeDefined();
    expect(result.response).toBe('Texto plano');
  });

  it('should generate product embedding', async () => {
    mockEmbeddings.embedQuery.mockResolvedValue([0.1, 0.2, 0.3]);

    const product = {
      name: 'Test',
      brand: 'Marca',
      description: 'Desc',
      product_type: 1,
      category: [1],
      skin_type: [1],
      ingredients: ['agua'],
    };

    const result = await service.generateProductEmbedding(product as any);
    expect(result).toEqual([0.1, 0.2, 0.3]);
  });

  it('should sync product embeddings', async () => {
    // Solo productos sin embedding o con embedding vacío
    const productsWithoutEmbeddings = [
      { _id: 'prod1', embedding: [], save: jest.fn().mockResolvedValue(true) },
      {
        _id: 'prod3',
        embedding: undefined,
        save: jest.fn().mockResolvedValue(true),
      },
    ];

    // Mockear productoModel.find() para que devuelva solo los productos sin embedding
    (service as any).productoModel = {
      find: jest.fn().mockImplementation((query) => {
        // Simular que la consulta filtra correctamente
        return {
          exec: jest.fn().mockResolvedValue(productsWithoutEmbeddings),
        };
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      }),
    };

    mockEmbeddings.embedQuery.mockResolvedValue([0.4, 0.5, 0.6]);

    const result = await service.syncProductEmbeddings();
    expect(result.synced).toBe(2);
    expect(result.skipped).toBe(0);
  });

  it('should handle embedding error', async () => {
    mockEmbeddings.embedQuery.mockRejectedValue(new Error('Embedding Error'));

    const product = {
      name: 'Test',
      brand: 'Marca',
      description: 'Desc',
      product_type: 1,
      category: [1],
      skin_type: [1],
      ingredients: ['agua'],
    };

    await expect(
      service.generateProductEmbedding(product as any),
    ).rejects.toThrow('Embedding Error');
  });
});
