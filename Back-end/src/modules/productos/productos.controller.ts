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
  Logger,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { BatchProductoDto } from './dto/batch-producto.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { FindProductosQueryDto } from './dto/find-productos-query.dto';

@ApiTags('Productos')
@Controller('productos')
export class ProductosController {
  private readonly logger = new Logger(ProductosController.name);

  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiOperation({ summary: 'Crear un nuevo producto', description: 'Crea un producto con imágenes subidas vía multipart/form-data' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
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
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(
    @Body() createProductoDto: CreateProductoDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    this.logger.log(
      `Creando producto ${createProductoDto.name} de ${createProductoDto.brand}`,
    );
    return this.productosService.create(createProductoDto, images);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos', description: 'Lista todos los productos con filtros opcionales (búsqueda, categoría, marcas, tipo de piel, ingredientes a excluir)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Término de búsqueda' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filtrar por categoría' })
  @ApiQuery({ name: 'brands', required: false, type: String, description: 'Filtrar por marcas (separadas por coma)' })
  @ApiQuery({ name: 'skinTypes', required: false, type: String, description: 'Filtrar por tipo de piel (separados por coma)' })
  @ApiQuery({ name: 'excludeIngredients', required: false, type: String, description: 'Ingredientes a excluir (separados por coma)' })
  @ApiQuery({
    name: 'includeEmbeddings',
    required: false,
    type: Boolean,
    description:
      'Incluir el vector de embedding en la respuesta (por defecto: false)',
  })
  @ApiResponse({ status: 200, description: 'Lista de productos' })
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
      this.logger.log(
        `Listando productos con filtros: ${JSON.stringify({
          search: query.search,
          category: query.category,
          brands: query.brands,
          skinTypes: query.skinTypes,
          excludeIngredients: query.excludeIngredients,
        })}`,
      );
      return this.productosService.findAllFiltered(
        {
          search: query.search,
          category: query.category,
          brands: query.brands
            ?.split(',')
            .map((b) => b.trim())
            .filter(Boolean),
          skinTypes: query.skinTypes
            ?.split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          excludeIngredients: query.excludeIngredients
            ?.split(',')
            .map((i) => i.trim())
            .filter(Boolean),
        },
        includeEmbeddings === 'true',
      );
    }

    this.logger.log('Listando todos los productos');
    return this.productosService.findAll(includeEmbeddings === 'true');
  }

  @Get('catalogos')
  @ApiOperation({ summary: 'Obtener catálogos', description: 'Obtiene los catálogos de tipo de piel, tipo de producto y categorías en español o inglés' })
  @ApiQuery({ name: 'lang', required: false, enum: ['es', 'en'], description: 'Idioma de los catálogos (es/en)' })
  @ApiResponse({ status: 200, description: 'Catálogos obtenidos exitosamente' })
  findCatalogs(@Query('lang') language?: 'es' | 'en') {
    this.logger.log(`Listando catálogos en idioma ${language ?? 'es'}`);
    return this.productosService.findCatalogs(language);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto (MongoDB ObjectId)' })
  @ApiQuery({
    name: 'includeEmbeddings',
    required: false,
    type: Boolean,
    description:
      'Incluir el vector de embedding en la respuesta (por defecto: false)',
  })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @Query('includeEmbeddings') includeEmbeddings?: string,
  ) {
    this.logger.log(`Buscando producto ${id}`);
    return this.productosService.findOne(id, includeEmbeddings === 'true');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto (MongoDB ObjectId)' })
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
  @ApiResponse({ status: 200, description: 'Producto actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    this.logger.log(`Actualizando producto ${id}`);
    return this.productosService.update(id, updateProductoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto (borrado lógico)' })
  @ApiParam({ name: 'id', description: 'ID del producto (MongoDB ObjectId)' })
  @ApiResponse({ status: 200, description: 'Producto eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    this.logger.log(`Eliminando producto ${id}`);
    return this.productosService.remove(id);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Obtener múltiples productos por IDs', description: 'Obtiene varios productos en un solo request mediante un array de IDs' })
  @ApiBody({
    type: BatchProductoDto,
    examples: {
      ejemplo: {
        summary: 'Obtener múltiples productos por ID',
        value: {
          productIds: ['69f8832d56dcaa1b4eb44a30', '69f8832d56dcaa1b4eb44a27'],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Productos encontrados' })
  async findBatch(@Body() body: BatchProductoDto) {
    this.logger.log(`Buscando lote de ${body.productIds.length} productos`);
    return this.productosService.findByIds(
      body.productIds,
      body.includeEmbeddings,
    );
  }
}
