import { Test, TestingModule } from '@nestjs/testing';
import { RutinasController } from './rutinas.controller';
import { RutinasService } from './rutinas.service';

describe('RutinasController', () => {
  let controller: RutinasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RutinasController],
      providers: [RutinasService],
    }).compile();

    controller = module.get<RutinasController>(RutinasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
