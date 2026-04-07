import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductosModule } from './productos/productos.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { RutinasModule } from './rutinas/rutinas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ProductosModule,
    ComentariosModule,
    RutinasModule,
    UsuariosModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
