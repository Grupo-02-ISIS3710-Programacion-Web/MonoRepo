import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { HttpException } from '@nestjs/common';

jest.mock('./ai.service');

describe('AiController', () => {
  let controller: AiController;
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [AiService],
    }).compile();

    controller = module.get<AiController>(AiController);
    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should generate routine', async () => {
    (service.generateRoutine as jest.Mock).mockResolvedValue({
      name: 'Rutina Test',
      steps: [],
    });

    const dto: any = { userId: 'u1', skinType: 'mixta', type: 'am' };
    const result = await controller.generateRoutine(dto);
    expect(result).toBeDefined();
  });

  it('should suggest products', async () => {
    (service.suggestProducts as jest.Mock).mockResolvedValue({
      suggestions: [],
    });

    const dto: any = { skinType: 'mixta', stepName: 'Limpieza' };
    const result = await controller.suggestProducts(dto);
    expect(result).toBeDefined();
  });
});
