import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductosModule } from './modules/productos/productos.module';
import { ComentariosModule } from './modules/comentarios/comentarios.module';
import { RutinasModule } from './modules/rutinas/rutinas.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
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
