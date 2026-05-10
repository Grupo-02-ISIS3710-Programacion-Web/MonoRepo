import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RutinasService } from './rutinas.service';
import { Rutina, RutinaSchema } from './entities/rutina.entity';
import { CreateRutinaDto } from './dto/create-rutina.dto';
import { UpdateRutinaDto } from './dto/update-rutina.dto';

describe('RutinasService (with in-memory MongoDB)', () => {
  let service: RutinasService;
  let rutinaModel: Model<Rutina>;
  let mongoUri: string;

  // Configuración inicial: crear servidor MongoDB en memoria
  beforeAll(async () => {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const server = await MongoMemoryServer.create();
    mongoUri = server.getUri();
    (global as any).__MONGO_SERVER_C_ = server;
  });

  // Configuración antes de cada prueba: limpiar base de datos
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

  // Limpieza final: detener servidor MongoDB
  afterAll(async () => {
    const server = (global as any).__MONGO_SERVER__;
    if (server) {
      await server.stop();
    }
  });

  // Prueba básica: el servicio está definido
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Prueba: crear una rutina
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

  // Prueba: listar rutinas con paginación
  it('should list routines with pagination', async () => {
    // Creamos dos rutinas de prueba
    const dto1: CreateRutinaDto = {
      userId: 'u1',
      name: 'Rutina 1',
      description: 'Desc 1',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    };
    const dto2: CreateRutinaDto = {
      userId: 'u2',
      name: 'Rutina 2',
      description: 'Desc 2',
      type: 'pm',
      skinType: 'seca',
      steps: [],
    };
    await service.create(dto1);
    await service.create(dto2);

    // Listamos la primera página (por defecto 20 por página)
    const result = await service.findAll();
    expect(result.routines.length).toBe(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
  });

  // Prueba: obtener rutinas por ID de usuario
  it('should get routines by user id', async () => {
    // Creamos dos rutinas para u1 y una para u2
    await service.create({
      userId: 'u1',
      name: 'Rutina u1 1',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    });
    await service.create({
      userId: 'u1',
      name: 'Rutina u1 2',
      description: 'Desc',
      type: 'pm',
      skinType: 'mixta',
      steps: [],
    });
    await service.create({
      userId: 'u2',
      name: 'Rutina u2 1',
      description: 'Desc',
      type: 'am',
      skinType: 'seca',
      steps: [],
    });

    const result = await service.findByUserId('u1');
    expect(result.routines.length).toBe(2);
    expect(result.total).toBe(2);
  });

  // Prueba: obtener una rutina por ID
  it('should get a routine by id', async () => {
    const dto: CreateRutinaDto = {
      userId: 'u1',
      name: 'Rutina de prueba',
      description: 'Descripción',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    };
    const created = await service.create(dto);
    const found = await service.findOne(created._id.toString());
    expect(found.name).toBe('Rutina de prueba');
    expect(found.userId).toBe('u1');
  });

  // Prueba: devolver null para ID inexistente
  it('should return null for non-existent routine id', async () => {
    const result = await service.findOne('607f1f77bcf86cd799439011');
    expect(result).toBeNull();
  });

  // Prueba: actualizar una rutina
  it('should update a routine', async () => {
    const dto: CreateRutinaDto = {
      userId: 'u1',
      name: 'Nombre original',
      description: 'Desc original',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    };
    const created = await service.create(dto);
    const updated = await service.update(created._id.toString(), { name: 'Nombre actualizado' } as UpdateRutinaDto);
    expect(updated.name).toBe('Nombre actualizado');
  });

  // Prueba: borrado lógico (marcar como eliminada)
  it('should soft delete a routine (mark as deleted)', async () => {
    const dto: CreateRutinaDto = {
      userId: 'u1',
      name: 'Rutina a eliminar',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    };
    const created = await service.create(dto);
    const deleted = await service.softDelete(created._id.toString());
    expect(deleted.deleted).toBe(true);

    // Verificamos que no aparece en listado general (filtra deleted: false)
    const result = await service.findAll();
    expect(result.total).toBe(0);
  });

  // Prueba: borrado físico (eliminar permanentemente)
  it('should hard delete a routine permanently', async () => {
    const dto: CreateRutinaDto = {
      userId: 'u1',
      name: 'Rutina a borrar',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    };
    const created = await service.create(dto);
    await service.hardDelete(created._id.toString());

    const found = await service.findOne(created._id.toString());
    expect(found).toBeNull();
  });

  // Prueba: votar positivamente una rutina
  it('should add upvote to routine', async () => {
    const dto: CreateRutinaDto = {
      userId: 'u1',
      name: 'Rutina con votos',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    };
    const created = await service.create(dto);
    const updated = await service.upvote(created._id.toString(), 'u2');
    expect(updated.upvotes).toContain('u2');
    expect(updated.upvotes.length).toBe(1);
  });

  // Prueba: remover voto positivo al votar otra vez
  it('should remove upvote if user upvotes again', async () => {
    const dto: CreateRutinaDto = {
      userId: 'u1',
      name: 'Rutina upvote test',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    };
    const created = await service.create(dto);
    const id = created._id.toString();

    // Primera vez: vota positivo
    await service.upvote(id, 'u2');
    // Segunda vez: remueve el voto
    const updated = await service.upvote(id, 'u2');
    expect(updated.upvotes).not.toContain('u2');
    expect(updated.upvotes.length).toBe(0);
  });

  // Prueba: votar negativamente una rutina
  it('should add downvote to routine', async () => {
    const dto: CreateRutinaDto = {
      userId: 'u1',
      name: 'Rutina downvote test',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    };
    const created = await service.create(dto);
    const id = created._id.toString();

    const updated = await service.downvote(id, 'u3');
    expect(updated.downvotes).toContain('u3');
  });

  // Prueba: incrementar contador de visualizaciones
  it('should increment view count', async () => {
    const dto: CreateRutinaDto = {
      userId: 'u1',
      name: 'Rutina con vistas',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    };
    const created = await service.create(dto);
    const id = created._id.toString();

    // Incrementamos vista una vez
    const updated = await service.incrementView(id);
    expect(updated.views).toBe(1);

    // Incrementamos otra vez
    const updated2 = await service.incrementView(id);
    expect(updated2.views).toBe(2);
  });

  // Prueba: obtener conteo de votos y visualizaciones
  it('should get vote and view counts', async () => {
    const dto: CreateRutinaDto = {
      userId: 'u1',
      name: 'Rutina conteo votos',
      description: 'Desc',
      type: 'am',
      skinType: 'mixta',
      steps: [],
    };
    const created = await service.create(dto);
    const id = created._id.toString();

    // Añadimos votos y vista
    await service.upvote(id, 'u2');
    await service.downvote(id, 'u3');
    await service.incrementView(id);

    const counts = await service.getVoteCounts(id);
    expect(counts.upvotes).toBe(1);
    expect(counts.downvotes).toBe(1);
    expect(counts.views).toBe(1);
  });
});
