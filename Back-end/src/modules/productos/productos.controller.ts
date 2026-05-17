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
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { BatchProductoDto } from './dto/batch-producto.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { FindProductosQueryDto } from './dto/find-productos-query.dto';

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
          items: { type: 'string' },
          example: ['normal', 'seca'],
        },
        product_type: { type: 'string', example: 'cream' },
        primary_category: { type: 'string', example: 'hidratacion' },
        additional_categories: {
          type: 'array',
          items: { type: 'string' },
          example: ['reparacion', 'limpieza'],
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
  @ApiConsumes('multipart/form-data')
  create(
    @Body() createProductoDto: CreateProductoDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.productosService.create(createProductoDto, images);
  }

  @Get()
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'brands', required: false, type: String })
  @ApiQuery({ name: 'skinTypes', required: false, type: String })
  @ApiQuery({ name: 'excludeIngredients', required: false, type: String })
  @ApiQuery({
    name: 'includeEmbeddings',
    required: false,
    type: Boolean,
    description:
      'Include the embedding vector in the response (default: false)',
  })
  findAll(
    @Query() query: FindProductosQueryDto,
    @Query('includeEmbeddings') includeEmbeddings?: string,
  ) {
    const hasFilters =
      query.search ||
      query.category ||
      query.brands ||
      query.skinTypes ||
      query.excludeIngredients;

    if (hasFilters) {
      return this.productosService.findAllFiltered(
        {
          search: query.search,
          category: query.category,
          brands: query.brands?.split(',').map((b) => b.trim()).filter(Boolean),
          skinTypes: query.skinTypes?.split(',').map((s) => s.trim()).filter(Boolean),
          excludeIngredients: query.excludeIngredients?.split(',').map((i) => i.trim()).filter(Boolean),
        },
        includeEmbeddings === 'true',
      );
    }

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
    description:
      'Include the embedding vector in the response (default: false)',
  })
  findOne(
    @Param('id', ParseObjectIdPipe) id: string,
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
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return this.productosService.update(id, updateProductoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
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
