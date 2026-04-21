import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import {
  CategoryCatalogSchema,
  ProductTypeCatalogSchema,
  SkinTypeCatalogSchema,
} from 'src/schema/catalog.schema';
import { ProductoSchema } from './entities/producto.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Producto', schema: ProductoSchema },
      { name: 'SkinTypeCatalog', schema: SkinTypeCatalogSchema },
      { name: 'ProductTypeCatalog', schema: ProductTypeCatalogSchema },
      { name: 'CategoryCatalog', schema: CategoryCatalogSchema },
    ]),
  ],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule { }
