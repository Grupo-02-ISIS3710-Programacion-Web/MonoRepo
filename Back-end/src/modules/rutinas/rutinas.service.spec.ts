import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RutinasService } from './rutinas.service';
import { Rutina, RutinaSchema } from './entities/rutina.entity';
import { CreateRutinaDto } from './dto/create-rutina.dto';

describe('RutinasService (with in-memory MongoDB)', () => {
  let service: RutinasService;
  let rutinaModel: Model<Rutina>;
  let mongoUri: string;

  beforeAll(async () => {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const server = await MongoMemoryServer.create();
    mongoUri = server.getUri();
    (global as any).__MONGO_SERVER__ = server;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([{ name: 'Rutina', schema: RutinaSchema }]),
      ],
      providers: [RutinasService],
    }).compile();

    service = module.get<RutinasService>(RutinasService);
    rutinaModel = module.get<Model<Rutina>>(getModelToken('Rutina'));
    await rutinaModel.deleteMany({});
  });

  afterAll(async () => {
    const server = (global as any).__MONGO_SERVER__;
    if (server) {
      await server.stop();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a routine', async () => {
    const dto: CreateRutinaDto = {
      userId: 'u1',
      name: 'Test Routine',
      description: 'Test Description',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    };
    const result = await service.create(dto);
    expect(result.name).toBe('Test Routine');
    expect(result.userId).toBe('u1');
  });
});
