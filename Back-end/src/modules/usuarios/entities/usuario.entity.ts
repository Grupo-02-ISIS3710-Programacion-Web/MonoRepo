import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Usuario extends Document {
    @Prop({ required: true })
    name: string;

    @Prop()
    avatarUrl: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    login: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    city: string;

    @Prop()
    skinType: string;

    @Prop()
    bio: string;

    @Prop()
    reviewCount: number;

    @Prop()
    favoriteProductIds: string[];

    @Prop()
    createdRoutineIds: string[];
}

const usuarioSchema = SchemaFactory.createForClass(Usuario);