import { Module } from '@nestjs/common';
import { ComentariosController } from './comentarios.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ComentarioSchema } from './entities/comentario.entity';
import { ComentariosService } from './comentarios.service';
import { ProductoSchema } from '../productos/entities/producto.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Comentario', schema: ComentarioSchema },
      { name: 'Producto', schema: ProductoSchema },
    ]),
  ],
  controllers: [ComentariosController],
  providers: [ComentariosService],
})
export class ComentariosModule {}
