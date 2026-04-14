import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { ProductoSchema } from 'src/schema/producto.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Producto', schema: ProductoSchema }])],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule { }
