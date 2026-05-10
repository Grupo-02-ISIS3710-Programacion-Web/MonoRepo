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
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { BatchProductoDto } from './dto/batch-producto.dto';
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
  @ApiQuery({
    name: 'includeEmbeddings',
    required: false,
    type: Boolean,
    description: 'Include the embedding vector in the response (default: false)',
  })
  findAll(@Query('includeEmbeddings') includeEmbeddings?: string) {
    return this.productosService.findAll(includeEmbeddings === 'true');
  }

  @Get('catalogos')
  findCatalogs(@Query('lang') language?: 'es' | 'en') {
    return this.productosService.findCatalogs(language);
  }

  @Get(':id')
  @ApiQuery({
    name: 'includeEmbeddings',
    required: false,
    type: Boolean,
    description: 'Include the embedding vector in the response (default: false)',
  })
  findOne(@Param('id') id: string, @Query('includeEmbeddings') includeEmbeddings?: string) {
    return this.productosService.findOne(id, includeEmbeddings === 'true');
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

  @Post('batch')
  @ApiBody({
    type: BatchProductoDto,
    examples: {
      ejemplo: {
        summary: 'Fetch multiple products by ID',
        value: {
          productIds: ['69f8832d56dcaa1b4eb44a30', '69f8832d56dcaa1b4eb44a27'],
        },
      },
    },
  })
  async findBatch(@Body() body: BatchProductoDto) {
    return this.productosService.findByIds(body.productIds);
  }
}
