import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export class RoutineStep {
    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    order: number;

    @Prop({ required: true })
    productId: string;

    @Prop({ type: Object, required: false })
    product?: object;

    @Prop({ required: false })
    notes?: string;
}

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Rutina extends Document {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: false })
    publishedAt?: string;

    @Prop({ required: true })
    type: string;

    @Prop({ required: true })
    skinType: string;

    @Prop({ type: [Object], required: true })
    steps: RoutineStep[];

    @Prop({ type: [Object], required: false })
    comments?: object[];

    @Prop({ type: [String], required: false })
    upvotes?: string[];

    @Prop({ type: [String], required: false })
    downvotes?: string[];

    @Prop({ default: 0 })
    views: number;

    @Prop({ default: false })
    deleted: boolean;

    id?: string;
}

export const RutinaSchema = SchemaFactory.createForClass(Rutina);

RutinaSchema.virtual('id').get(function() {
    return this._id?.toString();
});
