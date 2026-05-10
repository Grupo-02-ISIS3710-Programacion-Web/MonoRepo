import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @ApiBody({
    type: CreateProductoDto,
    examples: {
      ejemploBasico: {
        summary: 'Crear producto con IDs de catálogo',
        value: {
          name: 'Toleriane Double Repair Face Moisturizer',
          brand: 'La Roche-Posay',
          skin_type: [1, 2, 5],
          description: 'Crema hidratante para fortalecer la barrera cutánea.',
          product_type: 1,
          primary_category: 1,
          additional_categories: [5],
          ingredients: ['ceramida-3', 'niacinamida', 'glicerina'],
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createProductoDto: CreateProductoDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2 MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    images: Express.Multer.File[],
  ) {
    return this.productosService.create(createProductoDto, images);
  }

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Get('catalogos')
  findCatalogs(@Query('lang') language?: 'es' | 'en') {
    return this.productosService.findCatalogs(language);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  @ApiBody({
    type: UpdateProductoDto,
    examples: {
      ejemploActualizacion: {
        summary: 'Actualizar campos parciales del producto',
        value: {
          skin_type: [1, 4],
          primary_category: 2,
          additional_categories: [3],
          description: 'Nueva descripción del producto',
        },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return this.productosService.update(id, updateProductoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }
}
