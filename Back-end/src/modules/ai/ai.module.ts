import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { RutinasModule } from '../rutinas/rutinas.module';
import { ProductosModule } from '../productos/productos.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([]),
    forwardRef(() => RutinasModule),
    forwardRef(() => ProductosModule),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
