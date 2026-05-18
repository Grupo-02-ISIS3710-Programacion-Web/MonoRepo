import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comentario extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Producto', required: false })
  productId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Rutina', required: false })
  rutinaId?: Types.ObjectId;

  @Prop({ required: true })
  comment!: string;

  @Prop({ default: [] })
  upvotes!: string[];

  @Prop({ default: [] })
  downvotes!: string[];
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
