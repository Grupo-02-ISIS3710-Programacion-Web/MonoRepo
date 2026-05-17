import { Module } from '@nestjs/common';
import { RutinasService } from './rutinas.service';
import { RutinasController } from './rutinas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RutinaSchema } from './entities/rutina.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Rutina', schema: RutinaSchema }]),
  ],
  controllers: [RutinasController],
  providers: [RutinasService],
  exports: [MongooseModule, RutinasService],
})
export class RutinasModule {}
