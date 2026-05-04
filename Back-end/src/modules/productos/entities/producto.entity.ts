import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Category, ProductType, SkinType } from 'src/enums/enums';
import { Comentario } from 'src/modules/comentarios/entities/comentario.entity';

@Schema({ timestamps: true })
export class Producto extends Document {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: [Number], ref: 'SkinTypeCatalog' })
  skin_type: number[];

  @Prop({ required: true, type: Number, ref: 'ProductTypeCatalog' })
  product_type: number;

  @Prop({ required: true, type: [Number], ref: 'CategoryCatalog' })
  category: number[];

  @Prop({ required: true, type: [String] })
  ingredients: string[];

  @Prop({ required: true, type: [String] })
  image_url: string[];

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  review_count: number;

  @Prop({ type: [Number], default: [] })
  embedding?: number[];

  @Prop({ default: false })
  deleted: boolean;
}

export const ProductoSchema = SchemaFactory.createForClass(Producto);