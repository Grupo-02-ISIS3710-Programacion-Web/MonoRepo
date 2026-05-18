/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CATEGORY_CATALOG,
  CatalogLanguage,
  PRODUCT_TYPE_CATALOG,
  SKIN_TYPE_CATALOG,
  getCatalogIdByCode,
} from '../../enums/enums';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Producto } from './entities/producto.entity';
import { AiService } from '../ai/ai.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

interface CatalogDocument {
  _id: number;
  code: string;
  labels: {
    es: string;
    en: string;
  };
}

@Injectable()
export class ProductosService implements OnModuleInit {
  private readonly logger = new Logger(ProductosService.name);

  constructor(
    @InjectModel('Producto') private readonly productoModel: Model<Producto>,
    @InjectModel('SkinTypeCatalog')
    private readonly skinTypeCatalogModel: Model<CatalogDocument>,
    @InjectModel('ProductTypeCatalog')
    private readonly productTypeCatalogModel: Model<CatalogDocument>,
    @InjectModel('CategoryCatalog')
    private readonly categoryCatalogModel: Model<CatalogDocument>,
    @Inject(forwardRef(() => AiService))
    private readonly aiService: AiService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async onModuleInit(): Promise<void> {
    await Promise.all([
      this.seedCatalog(this.skinTypeCatalogModel, SKIN_TYPE_CATALOG),
      this.seedCatalog(this.productTypeCatalogModel, PRODUCT_TYPE_CATALOG),
      this.seedCatalog(this.categoryCatalogModel, CATEGORY_CATALOG),
    ]);
  }

  async create(
    createProductoDto: CreateProductoDto,
    images: Express.Multer.File[],
  ): Promise<Producto> {
    if (!images || images.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    const skin_type = (createProductoDto.skin_type || []).map((code) =>
      getCatalogIdByCode('skin_type', code),
    );
    const additional_categories = (
      createProductoDto.additional_categories || []
    ).map((code) => getCatalogIdByCode('category', code));
    const product_type = getCatalogIdByCode(
      'product_type',
      createProductoDto.product_type,
    );
    const primary_category = getCatalogIdByCode(
      'category',
      createProductoDto.primary_category,
    );

    await this.validateCatalogIds({
      skin_type,
      product_type,
      primary_category,
      additional_categories,
    });

    const imageUrls = await Promise.all(
      images.map((file) =>
        this.cloudinaryService.uploadBuffer(file.buffer, 'productos'),
      ),
    );

    const producto = new this.productoModel({
      name: createProductoDto.name,
      brand: createProductoDto.brand,
      description: createProductoDto.description,
      skin_type,
      product_type,
      category: [primary_category, ...additional_categories],
      ingredients: createProductoDto.ingredients,
      image_url: imageUrls,
      rating: 0,
      review_count: 0,
      deleted: false,
    });
    const saved = await producto.save();

    try {
      const embedding = await this.aiService.generateProductEmbedding(saved);
      return await this.productoModel
        .findByIdAndUpdate(saved._id, { $set: { embedding } }, { new: true })
        .exec();
    } catch (error) {
      this.logger.warn(
        `Failed to generate embedding for new product ${saved._id}: ${error.message}`,
      );
      return saved;
    }
  }

  async findAll(includeEmbeddings = false): Promise<any[]> {
    const projection = includeEmbeddings ? {} : { embedding: 0 };
    const products = await this.productoModel
      .find({ deleted: false }, projection)
      .lean()
      .exec();
    return this.normalizeProducts(products);
  }

  async findOne(id: string, includeEmbeddings = false): Promise<any | null> {
    const projection = includeEmbeddings ? {} : { embedding: 0 };
    const product = await this.productoModel
      .findById(id, projection)
      .lean()
      .exec();
    if (!product || product.deleted) {
      throw new NotFoundException(`Producto with id ${id} not found`);
    }
    const [normalized] = await this.normalizeProducts([product]);
    return normalized;
  }

  async findByIds(ids: string[], includeEmbeddings = false): Promise<any[]> {
    if (!ids || ids.length === 0) return [];
    const projection = includeEmbeddings ? {} : { embedding: 0 };
    const products = await this.productoModel
      .find({ _id: { $in: ids }, deleted: false }, projection)
      .lean()
      .exec();
    return this.normalizeProducts(products);
  }

  async findAllNormalized(): Promise<any[]> {
    const products = await this.productoModel
      .find({ deleted: false })
      .lean()
      .exec();
    return this.normalizeProducts(products);
  }

  private async normalizeProducts(products: any[]): Promise<any[]> {
    if (!products.length) return [];

    const [skinTypes, productTypes, categories] = await Promise.all([
      this.skinTypeCatalogModel.find().lean().exec(),
      this.productTypeCatalogModel.find().lean().exec(),
      this.categoryCatalogModel.find().lean().exec(),
    ]);

    const skinTypeMap = new Map(skinTypes.map((s) => [s._id, s.code]));
    const productTypeMap = new Map(productTypes.map((p) => [p._id, p.code]));
    const categoryMap = new Map(categories.map((c) => [c._id, c.code]));

    return products.map((p) => {
      const normalized = {
        id: p._id?.toString(),
        name: p.name,
        brand: p.brand,
        description: p.description,
        skin_type: (p.skin_type || []).map(
          (id: number) => skinTypeMap.get(id) || id,
        ),
        product_type: productTypeMap.get(p.product_type) || p.product_type,
        category: (p.category || []).map(
          (id: number) => categoryMap.get(id) || id,
        ),
        ingredients: p.ingredients || [],
        image_url: p.image_url || [],
        rating: p.rating ?? 0,
        review_count: p.review_count ?? 0,
      };
      if ('embedding' in p) {
        normalized['embedding'] = p.embedding;
      }
      return normalized;
    });
  }

  async update(
    id: string,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto | null> {
    const updateData: Record<string, unknown> = {};

    if (
      updateProductoDto.skin_type ||
      updateProductoDto.product_type ||
      updateProductoDto.primary_category
    ) {
      const skin_type = updateProductoDto.skin_type
        ? (updateProductoDto.skin_type || []).map((code) =>
            getCatalogIdByCode('skin_type', code),
          )
        : undefined;
      const additional_categories = updateProductoDto.additional_categories
        ? (updateProductoDto.additional_categories || []).map((code) =>
            getCatalogIdByCode('category', code),
          )
        : undefined;
      const product_type = updateProductoDto.product_type
        ? getCatalogIdByCode('product_type', updateProductoDto.product_type)
        : undefined;
      const primary_category = updateProductoDto.primary_category
        ? getCatalogIdByCode('category', updateProductoDto.primary_category)
        : undefined;
      await this.validateCatalogIds({
        skin_type,
        product_type,
        primary_category,
        additional_categories,
      });
    }

    if (updateProductoDto.name) updateData.name = updateProductoDto.name;
    if (updateProductoDto.brand) updateData.brand = updateProductoDto.brand;
    if (updateProductoDto.description)
      updateData.description = updateProductoDto.description;
    if (updateProductoDto.skin_type)
      updateData.skin_type = updateProductoDto.skin_type;
    if (updateProductoDto.product_type)
      updateData.product_type = updateProductoDto.product_type;
    if (updateProductoDto.ingredients)
      updateData.ingredients = updateProductoDto.ingredients;

    if (updateProductoDto.primary_category) {
      const categories = [updateProductoDto.primary_category];
      if (updateProductoDto.additional_categories) {
        categories.push(...updateProductoDto.additional_categories);
      }
      updateData.category = categories;
    }

    const updated = await this.productoModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (
      updated &&
      (updateData.name ||
        updateData.brand ||
        updateData.description ||
        updateData.skin_type ||
        updateData.product_type ||
        updateData.category ||
        updateData.ingredients)
    ) {
      try {
        const embedding =
          await this.aiService.generateProductEmbedding(updated);
        return await this.productoModel
          .findByIdAndUpdate(id, { $set: { embedding } }, { new: true })
          .exec();
      } catch (error) {
        this.logger.warn(
          `Failed to regenerate embedding for updated product ${id}: ${error.message}`,
        );
      }
    }

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const resultado = await this.productoModel
      .findByIdAndUpdate(id, { deleted: true }, { new: true })
      .exec();
    if (resultado) {
      return { message: `Se ha eliminado el producto con id ${id}` };
    }
    return { message: `No se encontró el producto con id ${id}` };
  }

  private async seedCatalog(
    model: Model<CatalogDocument>,
    values: Array<{
      id: number;
      code: string;
      labels: Record<CatalogLanguage, string>;
    }>,
  ): Promise<void> {
    await Promise.all(
      values.map((value) =>
        model
          .updateOne(
            { _id: value.id },
            {
              $set: {
                code: value.code,
                labels: value.labels,
              },
            },
            { upsert: true },
          )
          .exec(),
      ),
    );
  }

  private async validateCatalogIds(input: {
    skin_type?: number[];
    product_type?: number;
    primary_category?: number;
    additional_categories?: number[];
  }): Promise<void> {
    if (input.skin_type) {
      const uniqueSkinTypeIds = [...new Set(input.skin_type)];
      const count = await this.skinTypeCatalogModel
        .countDocuments({ _id: { $in: uniqueSkinTypeIds } })
        .exec();
      if (count !== uniqueSkinTypeIds.length) {
        throw new BadRequestException('Uno o más IDs en skin_type no existen');
      }
    }

    if (input.product_type !== undefined) {
      const exists = await this.productTypeCatalogModel
        .exists({ _id: input.product_type })
        .exec();
      if (!exists) {
        throw new BadRequestException(
          `El ID de product_type ${input.product_type} no existe`,
        );
      }
    }

    const categoriesToValidate: number[] = [];
    if (input.primary_category !== undefined) {
      categoriesToValidate.push(input.primary_category);
    }
    if (
      input.additional_categories !== undefined &&
      input.additional_categories !== null
    ) {
      const additional = Array.isArray(input.additional_categories)
        ? input.additional_categories
        : [input.additional_categories];
      categoriesToValidate.push(...additional);
    }

    if (categoriesToValidate.length > 0) {
      const uniqueCategoryIds = [...new Set(categoriesToValidate)];
      const count = await this.categoryCatalogModel
        .countDocuments({ _id: { $in: uniqueCategoryIds } })
        .exec();
      if (count !== uniqueCategoryIds.length) {
        throw new BadRequestException('Uno o más IDs en category no existen');
      }
    }
  }

  async findCatalogs(language: CatalogLanguage = 'es') {
    const lang = language === 'en' ? 'en' : 'es';
    const [skinTypes, productTypes, categories] = await Promise.all([
      this.skinTypeCatalogModel.find().sort({ _id: 1 }).lean().exec(),
      this.productTypeCatalogModel.find().sort({ _id: 1 }).lean().exec(),
      this.categoryCatalogModel.find().sort({ _id: 1 }).lean().exec(),
    ]);

    return {
      skin_type: skinTypes.map((item) => ({
        id: item._id,
        code: item.code,
        label: item.labels[lang],
      })),
      product_type: productTypes.map((item) => ({
        id: item._id,
        code: item.code,
        label: item.labels[lang],
      })),
      category: categories.map((item) => ({
        id: item._id,
        code: item.code,
        label: item.labels[lang],
      })),
    };
  }

  async findAllFiltered(
    params: {
    search?: string;
    category?: string;
    brands?: string[];
    skinTypes?: string[];
    excludeIngredients?: string[];
    },
    includeEmbeddings = false,
  ): Promise<any[]> {
    const query: Record<string, any> = { deleted: false };

    // Resolver category code → ID numérico
    if (params.category && params.category !== 'ALL') {
      const cat = await this.categoryCatalogModel
        .findOne({ code: params.category })
        .lean()
        .exec();
      if (cat) query.category = cat._id;
    }

    // Resolver skinType codes → IDs numéricos
    if (params.skinTypes?.length) {
      const skinDocs = await this.skinTypeCatalogModel
        .find({ code: { $in: params.skinTypes } })
        .lean()
        .exec();
      if (skinDocs.length) {
        query.skin_type = { $in: skinDocs.map((s) => s._id) };
      }
    }

    // Filtro por marcas (texto exacto, case-insensitive)
    if (params.brands?.length) {
      query.brand = {
        $in: params.brands.map((b) => new RegExp(`^${b}$`, 'i')),
      };
    }

    // Excluir ingredientes
    if (params.excludeIngredients?.length) {
      query.ingredients = { $nin: params.excludeIngredients };
    }

    // Búsqueda de texto libre en name, brand e ingredients
    if (params.search) {
      const regex = new RegExp(params.search, 'i');
      query.$or = [
        { name: regex },
        { brand: regex },
        { ingredients: regex },
      ];
    }

    const projection = includeEmbeddings ? {} : { embedding: 0 };
    const products = await this.productoModel
      .find(query, projection)
      .lean()
      .exec();

    return this.normalizeProducts(products);
  }
}
