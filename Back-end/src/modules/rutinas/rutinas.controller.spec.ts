import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { RutinasController } from './rutinas.controller';
import { RutinasService } from './rutinas.service';
import { Rutina, RutinaSchema } from './entities/rutina.entity';
import { Model } from 'mongoose';

describe('RutinasController', () => {
  let controller: RutinasController;
  let service: RutinasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(process.env.MONGO_MEMORY_URI),
        MongooseModule.forFeature([{ name: 'Rutina', schema: RutinaSchema }]),
      ],
      controllers: [RutinasController],
      providers: [RutinasService],
    }).compile();

    controller = module.get<RutinasController>(RutinasController);
    service = module.get<RutinasService>(RutinasService);
    const rutinaModel = module.get<Model<Rutina>>(getModelToken('Rutina'));
    await rutinaModel.deleteMany({});
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create routine via controller', async () => {
    const dto = {
      userId: 'u1',
      name: 'Test',
      description: 'Test',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    };
    const result = await controller.create(dto as any);
    expect(result.name).toBe('Test');
  });
});
