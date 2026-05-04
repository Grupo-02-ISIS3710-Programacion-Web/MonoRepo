import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';

describe('AiService (with mocked methods)', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
    
    // Mock the internal methods to avoid external API calls
    jest.spyOn(service as any, 'loadAvailableProducts').mockResolvedValue(undefined);
    (service as any).availableProducts = [
      { id: '12', name: 'Producto Test', skin_type: ['mixta'] },
    ];
    jest.spyOn(service as any, 'generateRoutineWithAI').mockResolvedValue({
      name: 'Rutina Test',
      description: 'Descripción',
      steps: [{ name: 'Paso 1', productId: '12', notes: '' }],
    });
    jest.spyOn(service as any, 'suggestProductsWithAI').mockResolvedValue({
      suggestions: [{ productId: '12', reason: 'Buen producto' }],
    });
    jest.spyOn(service as any, 'chatWithAIInternal').mockResolvedValue({
      response: 'Hola, te ayudo',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate routine', async () => {
    const result = await service.generateRoutine({
      userId: 'u1',
      skinType: 'mixta',
      type: 'am',
    });

    expect(result).toBeDefined();
    expect(result.name).toBe('Rutina Test');
  });

  it('should suggest products', async () => {
    const result = await service.suggestProducts({
      skinType: 'mixta',
      stepName: 'Limpieza',
    });

    expect(result).toBeDefined();
    expect(result.suggestions).toBeDefined();
  });

  it('should chat with AI', async () => {
    const result = await service.chatWithAI({
      userId: 'u1',
      messages: [{ role: 'user', content: 'Hola' }],
    });

    expect(result).toBeDefined();
    expect(result.response).toBeDefined();
  });
});
