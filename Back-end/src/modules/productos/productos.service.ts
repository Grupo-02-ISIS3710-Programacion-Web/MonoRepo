import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CATEGORY_CATALOG,
  CatalogLanguage,
  PRODUCT_TYPE_CATALOG,
  SKIN_TYPE_CATALOG,
} from '../../enums/enums';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Producto } from './entities/producto.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

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
  constructor(
    @InjectModel('Producto') private readonly productoModel: Model<Producto>,
    @InjectModel('SkinTypeCatalog')
    private readonly skinTypeCatalogModel: Model<CatalogDocument>,
    @InjectModel('ProductTypeCatalog')
    private readonly productTypeCatalogModel: Model<CatalogDocument>,
    @InjectModel('CategoryCatalog')
    private readonly categoryCatalogModel: Model<CatalogDocument>,
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
    await this.validateCatalogIds(createProductoDto);

    const imageUrls = await Promise.all(
      images.map((file) =>
        this.cloudinaryService.uploadBuffer(file.buffer, 'productos'),
      ),
    );

    const producto = new this.productoModel({
      name: createProductoDto.name,
      brand: createProductoDto.brand,
      description: createProductoDto.description,
      skin_type: createProductoDto.skin_type,
      product_type: createProductoDto.product_type,
      category: [
        createProductoDto.primary_category,
        ...(createProductoDto.additional_categories || []),
      ],
      ingredients: createProductoDto.ingredients,
      image_url: imageUrls,
      rating: 0,
      review_count: 0,
      deleted: false,
    });
    return await producto.save();
  }

  async findAll(): Promise<Producto[]> {
    return await this.productoModel.find({ deleted: false }).exec();
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

  async findOne(id: string): Promise<Producto | null> {
    return await this.productoModel.findById(id).exec();
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
      await this.validateCatalogIds({
        skin_type: updateProductoDto.skin_type,
        product_type: updateProductoDto.product_type,
        primary_category: updateProductoDto.primary_category,
        additional_categories: updateProductoDto.additional_categories,
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

    return await this.productoModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
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
    if (input.additional_categories) {
      categoriesToValidate.push(...input.additional_categories);
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
}
