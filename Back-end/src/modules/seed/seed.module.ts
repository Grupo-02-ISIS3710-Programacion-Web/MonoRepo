import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Mongoose } from 'mongoose';
import { ProductoSchema } from '../productos/entities/producto.entity';
import { RutinaSchema } from '../rutinas/entities/rutina.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Producto', schema: ProductoSchema },
      { name: 'Rutina', schema: RutinaSchema },
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule { }
