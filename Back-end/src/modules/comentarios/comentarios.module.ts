import { Module } from '@nestjs/common';
import { ComentariosController } from './comentarios.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ComentarioSchema } from './entities/comentario.entity';
import { ComentariosService } from './comentarios.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Comentario', schema: ComentarioSchema }])],
  controllers: [ComentariosController],
  providers: [ComentariosService],
})
export class ComentariosModule { }
