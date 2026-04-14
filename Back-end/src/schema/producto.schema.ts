import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Category, ProductType, SkinType } from "src/enums/enums";

@Schema({ timestamps: true })
export class Producto extends Document {

    @Prop({ required: true })
    name!: string;

    @Prop({ required: true })
    brand!: string;

    @Prop({ required: true })
    description!: string;

    @Prop({ required: true, type: [String], enum: Object.values(SkinType) })
    skin_type!: SkinType[];

    @Prop({ required: true, enum: Object.values(ProductType) })
    product_type!: ProductType;

    @Prop({ required: true, type: [String], enum: Object.values(Category) })
    category!: Category[];

    @Prop({ required: true, type: [String] })
    ingredients!: string[];

    @Prop({ required: true, type: [String] })
    image_url!: string[];

    @Prop({ default: 0 })
    rating!: number;

    @Prop({ default: 0 })
    review_count!: number;

    @Prop({ default: false })
    deleted!: boolean;
}

export const ProductoSchema = SchemaFactory.createForClass(Producto);