import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
export class CatalogLabels {
  @Prop({ required: true })
  es!: string;

  @Prop({ required: true })
  en!: string;
}

@Schema({ collection: 'skin_type_catalog', versionKey: false })
export class SkinTypeCatalog {
  @Prop({ type: Number, required: true })
  _id!: number;

  @Prop({ required: true, unique: true })
  code!: string;

  @Prop({ type: CatalogLabels, required: true })
  labels!: CatalogLabels;
}

@Schema({ collection: 'product_type_catalog', versionKey: false })
export class ProductTypeCatalog {
  @Prop({ type: Number, required: true })
  _id!: number;

  @Prop({ required: true, unique: true })
  code!: string;

  @Prop({ type: CatalogLabels, required: true })
  labels!: CatalogLabels;
}

@Schema({ collection: 'category_catalog', versionKey: false })
export class CategoryCatalog {
  @Prop({ type: Number, required: true })
  _id!: number;

  @Prop({ required: true, unique: true })
  code!: string;

  @Prop({ type: CatalogLabels, required: true })
  labels!: CatalogLabels;
}

export const SkinTypeCatalogSchema: MongooseSchema =
  SchemaFactory.createForClass(SkinTypeCatalog);
export const ProductTypeCatalogSchema: MongooseSchema =
  SchemaFactory.createForClass(ProductTypeCatalog);
export const CategoryCatalogSchema: MongooseSchema =
  SchemaFactory.createForClass(CategoryCatalog);
