import { Module } from '@nestjs/common';
import { RutinasService } from './rutinas.service';
import { RutinasController } from './rutinas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RutinaSchema } from './entities/rutina.entity';
import { UserSchema } from '../user/entities/user.entity';
import { ComentarioSchema } from '../comentarios/entities/comentario.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Rutina', schema: RutinaSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Comentario', schema: ComentarioSchema },
    ]),
  ],
  controllers: [RutinasController],
  providers: [RutinasService],
  exports: [MongooseModule, RutinasService],
})
export class RutinasModule {}
