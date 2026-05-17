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
import { AiModule } from './modules/ai/ai.module';
import { ChatsModule } from './modules/chats/chats.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadModule } from './modules/upload/upload.module';
import {SuscripcionesModule} from "./modules/suscripciones/suscripciones.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
   
    MongooseModule.forFeature([
      { name: 'Producto', schema: ProductoSchema },
      { name: 'Rutina', schema: RutinaSchema },
      { name: 'User', schema: UserSchema },
    ]),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI,
      }),
    }),
    ProductosModule,
    ComentariosModule,
    RutinasModule,
    SeedModule,
    UserModule,
    AuthModule,
    AiModule,
    ChatsModule,
    CloudinaryModule,
    UploadModule,
    SuscripcionesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
