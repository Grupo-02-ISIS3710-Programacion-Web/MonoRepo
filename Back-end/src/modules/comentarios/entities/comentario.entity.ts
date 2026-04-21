import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Comentario extends Document {
    @Prop({ required: true })
    userId!: string;
    @Prop({ required: true })
    comment!: string;
    @Prop({ required: true })
    createdAt!: string;
    @Prop({ default: [] })
    upvotes!: string[];
    @Prop({ default: [] })
    downvotes!: string[];
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);