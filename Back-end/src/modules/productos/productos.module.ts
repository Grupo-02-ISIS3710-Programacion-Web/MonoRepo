import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule }  from '@nestjs/platform-express';
import { memoryStorage }  from 'multer';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import {
  CategoryCatalogSchema,
  ProductTypeCatalogSchema,
  SkinTypeCatalogSchema,
} from '../../schema/catalog.schema';
import { ProductoSchema } from './entities/producto.entity';
import { AiModule } from '../ai/ai.module';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Producto', schema: ProductoSchema },
      { name: 'SkinTypeCatalog', schema: SkinTypeCatalogSchema },
      { name: 'ProductTypeCatalog', schema: ProductTypeCatalogSchema },
      { name: 'CategoryCatalog', schema: CategoryCatalogSchema },
    ]),
    forwardRef(() => AiModule),
    MulterModule.register({ storage: memoryStorage() }),
    CloudinaryModule,
  ],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [MongooseModule, ProductosService],
})
export class ProductosModule {}
