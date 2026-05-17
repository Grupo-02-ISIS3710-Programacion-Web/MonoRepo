import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RutinasController } from './rutinas.controller';
import { RutinasService } from './rutinas.service';
import { Rutina, RutinaSchema } from './entities/rutina.entity';
import { CreateRutinaDto } from './dto/create-rutina.dto';
import { UpdateRutinaDto } from './dto/update-rutina.dto';

describe('RutinasController (with in-memory MongoDB)', () => {
  let controller: RutinasController;
  let service: RutinasService;
  let rutinaModel: Model<Rutina>;
  let mongoUri: string;

  // Configuración inicial: crear servidor MongoDB en memoria
  beforeAll(async () => {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const server = await MongoMemoryServer.create();
    mongoUri = server.getUri();
    (global as any).__MONGO_SERVER__ = server;
  });

  // Configuración antes de cada prueba: limpiar base de datos
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([{ name: 'Rutina', schema: RutinaSchema }]),
      ],
      controllers: [RutinasController],
      providers: [RutinasService],
    }).compile();

    controller = module.get<RutinasController>(RutinasController);
    service = module.get<RutinasService>(RutinasService);
    rutinaModel = module.get<Model<Rutina>>(getModelToken('Rutina'));
    await rutinaModel.deleteMany({});
  });

  // Limpieza final: detener servidor MongoDB
  afterAll(async () => {
    const server = (global as any).__MONGO_SERVER__;
    if (server) {
      await server.stop();
    }
  });

  // Prueba básica: el controlador está definido
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Prueba: crear rutina vía controlador
  it('should create routine via controller', async () => {
    const dto: CreateRutinaDto = {
      userId: 'u1',
      name: 'Rutina controlador',
      description: 'Test',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    };
    const result = await controller.create(dto);
    expect(result.name).toBe('Rutina controlador');
    expect(result.userId).toBe('u1');
  });

  // Prueba: listar rutinas vía controlador
  it('should list routines via controller', async () => {
    // Creamos dos rutinas
    await controller.create({
      userId: 'u1',
      name: 'Rutina 1',
      description: 'Desc 1',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    });
    await controller.create({
      userId: 'u2',
      name: 'Rutina 2',
      description: 'Desc 2',
      type: 'pm',
      skinType: 'seca',
      steps: [],
    });

    const result = await controller.findAll();
    expect(result.routines.length).toBe(2);
    expect(result.total).toBe(2);
  });

  // Prueba: listar rutinas con ordenamiento por más recientes
  it('should list routines sorted by newest', async () => {
    const r1 = await controller.create({
      userId: 'u1',
      name: 'Rutina vieja',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    });

    // Pequeña pausa para asegurar diferencia en timestamps
    await new Promise((resolve) => setTimeout(resolve, 100));

    const r2 = await controller.create({
      userId: 'u1',
      name: 'Rutina nueva',
      description: 'Desc',
      type: 'pm',
      skinType: 'mixta',
      steps: [],
    });

    const result = await controller.findAll('1', 'newest');
    expect(result.routines[0].name).toBe('Rutina nueva');
  });

  // Prueba: obtener rutinas por usuario vía controlador
  it('should get routines by user id via controller', async () => {
    await controller.create({
      userId: 'u1',
      name: 'Rutina u1',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    });
    await controller.create({
      userId: 'u1',
      name: 'Otra rutina u1',
      description: 'Desc',
      type: 'pm',
      skinType: 'mixta',
      steps: [],
    });
    await controller.create({
      userId: 'u2',
      name: 'Rutina u2',
      description: 'Desc',
      type: 'am',
      skinType: 'seca',
      steps: [],
    });

    const result = await controller.findByUserId('u1');
    expect(result.routines.length).toBe(2);
  });

  // Prueba: obtener rutina por ID vía controlador
  it('should get routine by id via controller', async () => {
    const created = await controller.create({
      userId: 'u1',
      name: 'Buscar por ID',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    });

    const found = await controller.findOne(created._id.toString());
    expect(found.name).toBe('Buscar por ID');
  });

  // Prueba: actualizar rutina vía controlador
  it('should update routine via controller', async () => {
    const created = await controller.create({
      userId: 'u1',
      name: 'Nombre antes',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    });

    const updated = await controller.update(created._id.toString(), {
      name: 'Nombre después',
    });
    expect(updated.name).toBe('Nombre después');
  });

  // Prueba: borrado lógico vía controlador
  it('should soft delete routine via controller', async () => {
    const created = await controller.create({
      userId: 'u1',
      name: 'Eliminar',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    });

    const deleted = await controller.softDelete(created._id.toString());
    expect(deleted.deleted).toBe(true);
  });

  // Prueba: borrado físico vía controlador
  it('should hard delete routine via controller', async () => {
    const created = await controller.create({
      userId: 'u1',
      name: 'Borrar permanente',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    });

    await controller.hardDelete(created._id.toString());
    const found = await controller.findOne(created._id.toString());
    expect(found).toBeNull();
  });

  // Prueba: votar positivamente vía controlador
  it('should upvote via controller', async () => {
    const created = await controller.create({
      userId: 'u1',
      name: 'Votar positivo',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    });

    const updated = await controller.upvote(created._id.toString(), 'u2');
    expect(updated.upvotes).toContain('u2');
  });

  // Prueba: votar negativamente vía controlador
  it('should downvote via controller', async () => {
    const created = await controller.create({
      userId: 'u1',
      name: 'Votar negativo',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    });

    const updated = await controller.downvote(created._id.toString(), 'u3');
    expect(updated.downvotes).toContain('u3');
  });

  // Prueba: remover voto positivo vía controlador
  it('should remove upvote via controller', async () => {
    const created = await controller.create({
      userId: 'u1',
      name: 'Remover voto positivo',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    });
    const id = created._id.toString();

    // Primero votamos
    await controller.upvote(id, 'u2');
    // Luego removemos
    const updated = await controller.removeUpvote(id, 'u2');
    expect(updated.upvotes).not.toContain('u2');
  });

  // Prueba: remover voto negativo vía controlador
  it('should remove downvote via controller', async () => {
    const created = await controller.create({
      userId: 'u1',
      name: 'Remover voto negativo',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    });
    const id = created._id.toString();

    // Primero votamos negativo
    await controller.downvote(id, 'u3');
    // Luego removemos
    const updated = await controller.removeDownvote(id, 'u3');
    expect(updated.downvotes).not.toContain('u3');
  });

  // Prueba: incrementar visualizaciones vía controlador
  it('should increment views via controller', async () => {
    const created = await controller.create({
      userId: 'u1',
      name: 'Vistas',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    });

    const updated = await controller.incrementView(created._id.toString());
    expect(updated.views).toBe(1);
  });

  // Prueba: obtener conteo de votos vía controlador
  it('should get vote counts via controller', async () => {
    const created = await controller.create({
      userId: 'u1',
      name: 'Conteo votos',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    });
    const id = created._id.toString();

    await controller.upvote(id, 'u2');
    await controller.downvote(id, 'u3');
    await controller.incrementView(id);

    const counts = await controller.getVoteCounts(id);
    expect(counts.upvotes).toBe(1);
    expect(counts.downvotes).toBe(1);
    expect(counts.views).toBe(1);
  });
});
