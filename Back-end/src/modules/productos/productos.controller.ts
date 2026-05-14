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
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { BatchProductoDto } from './dto/batch-producto.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        // Add all your DTO fields here
        name: {
          type: 'string',
          example: 'Toleriane Double Repair Face Moisturizer',
        },
        brand: { type: 'string', example: 'La Roche-Posay' },
        description: {
          type: 'string',
          example: 'Crema hidratante para fortalecer la barrera cutánea.',
        },
        skin_type: {
          type: 'array',
          items: { type: 'number' },
          example: [, 3, 5],
        },
        product_type: { type: 'number', example: 1 },
        primary_category: { type: 'number', example: 1 },
        additional_categories: {
          type: 'array',
          items: { type: 'number' },
          example: [5, 2],
        },
        ingredients: {
          type: 'array',
          items: { type: 'string' },
          example: ['ceramida-3', 'niacinamida', 'glicerina'],
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: [
        'name',
        'brand',
        'description',
        'skin_type',
        'product_type',
        'primary_category',
        'ingredients',
        'images',
      ],
    },
  })
  create(
    @Body() createProductoDto: CreateProductoDto,
    @UploadedFiles() images: Express.Multer.File[],
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
  findOne(
    @Param('id') id: string,
    @Query('includeEmbeddings') includeEmbeddings?: string,
  ) {
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
