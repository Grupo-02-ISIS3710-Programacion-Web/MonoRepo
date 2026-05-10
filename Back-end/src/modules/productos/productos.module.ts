import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule }  from '@nestjs/platform-express';
import { memoryStorage }  from 'multer';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import {
  CategoryCatalogSchema,
  ProductTypeCatalogSchema,
  SkinTypeCatalogSchema,
} from 'src/schema/catalog.schema';
import { ProductoSchema } from './entities/producto.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Producto', schema: ProductoSchema },
      { name: 'SkinTypeCatalog', schema: SkinTypeCatalogSchema },
      { name: 'ProductTypeCatalog', schema: ProductTypeCatalogSchema },
      { name: 'CategoryCatalog', schema: CategoryCatalogSchema },
    ]),
    MulterModule.register({ storage: memoryStorage() }),
    CloudinaryModule,
  ],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}
