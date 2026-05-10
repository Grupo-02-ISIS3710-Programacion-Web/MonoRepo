import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductosModule } from './modules/productos/productos.module';
import { ComentariosModule } from './modules/comentarios/comentarios.module';
import { RutinasModule } from './modules/rutinas/rutinas.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedModule } from './modules/seed/seed.module';
import { ProductoSchema } from './modules/productos/entities/producto.entity';
import { RutinaSchema } from './modules/rutinas/entities/rutina.entity';
import { UserModule } from './modules/user/user.module';
import { UserSchema } from './modules/user/entities/user.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(`mongodb://admin:password123@mongodb:27017`),
    MongooseModule.forFeature([
      { name: 'Producto', schema: ProductoSchema },
      { name: 'Rutina', schema: RutinaSchema },
      { name: 'User', schema: UserSchema },
    ]),
    ProductosModule,
    ComentariosModule,
    RutinasModule,
    SeedModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
