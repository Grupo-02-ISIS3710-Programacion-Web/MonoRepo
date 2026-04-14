import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductosModule } from './modules/productos/productos.module';
import { ComentariosModule } from './modules/comentarios/comentarios.module';
import { RutinasModule } from './modules/rutinas/rutinas.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductoSchema } from './schema/producto.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(`mongodb://admin:password123@mongodb:27017`),
    MongooseModule.forFeature([{ name: 'Producto', schema: ProductoSchema }]),
    ProductosModule,
    ComentariosModule,
    RutinasModule,
    UsuariosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
