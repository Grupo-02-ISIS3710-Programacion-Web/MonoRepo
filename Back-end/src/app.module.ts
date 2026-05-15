import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductosModule } from './modules/productos/productos.module';
import { ComentariosModule } from './modules/comentarios/comentarios.module';
import { RutinasModule } from './modules/rutinas/rutinas.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedModule } from './modules/seed/seed.module';
import { AiModule } from './modules/ai/ai.module';
import { ChatsModule } from './modules/chats/chats.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI,
      }),
    }),
    ProductosModule,
    ComentariosModule,
    RutinasModule,
    SeedModule,
    AiModule,
    ChatsModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
