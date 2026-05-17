import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document, Types } from "mongoose";

export class RoutineStep {
    @ApiProperty({
        description: 'Identificador único del paso en la rutina',
        example: 'r1s1'
    })
    @Prop({ required: true })
    id: string;

    @ApiProperty({
        description: 'Nombre del paso de la rutina',
        example: 'Limpieza suave'
    })
    @Prop({ required: true })
    name: string;

    @ApiProperty({
        description: 'Orden de ejecución del paso (empezando por 0)',
        example: 0
    })
    @Prop({ required: true })
    order: number;

    @ApiProperty({
        description: 'ID del producto utilizado en este paso',
        example: '12'
    })
    @Prop({ required: true })
    productId: string;

    @ApiProperty({
        description: 'Información del producto (opcional, se puede poblar desde la base de datos)',
        required: false,
        example: { name: 'Cleanser Suave', brand: 'Marca X' }
    })
    @Prop({ type: Object, required: false })
    product?: object;

    @ApiProperty({
        description: 'Notas adicionales sobre cómo aplicar el producto en este paso',
        required: false,
        example: 'Usar con agua tibia, masajear en círculos durante 30 segundos.'
    })
    @Prop({ required: false })
    notes?: string;
}

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Rutina extends Document {
    @ApiProperty({
        description: 'ID del usuario que creó la rutina',
        example: 'u1'
    })
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @ApiProperty({
        description: 'Nombre de la rutina',
        example: 'Rutina básica de mañana'
    })
    @Prop({ required: true })
    name: string;

    @ApiProperty({
        description: 'Descripción detallada de la rutina y sus beneficios',
        example: 'Rutina sencilla de 3 pasos para comenzar el día con la piel limpia e hidratada.'
    })
    @Prop({ required: true })
    description: string;

    @ApiProperty({
        description: 'Fecha de publicación de la rutina en formato ISO 8601',
        required: false,
        example: '2026-03-14T09:20:00.000Z'
    })
    @Prop({ required: false })
    publishedAt?: string;

    @ApiProperty({
        description: 'Tipo de rutina: "am" para mañana, "pm" para noche',
        example: 'am',
        enum: ['am', 'pm']
    })
    @Prop({ required: true })
    type: string;

    @ApiProperty({
        description: 'Tipo de piel para la cual está diseñada la rutina',
        example: 'normal',
        enum: ['normal', 'seca', 'grasa', 'mixta', 'sensible', 'opaca', 'texturizada', 'acneica']
    })
    @Prop({ required: true })
    skinType: string;

    @ApiProperty({
        description: 'Lista de pasos que componen la rutina',
        type: [RoutineStep]
    })
    @Prop({ type: [Object], required: true })
    steps: RoutineStep[];

    @ApiProperty({
        description: 'Lista de comentarios en la rutina',
        required: false,
        type: [Object]
    })
    @Prop({ type: [Object], required: false })
    comments?: object[];

    @ApiProperty({
        description: 'Lista de IDs de usuarios que dieron voto positivo',
        required: false,
        type: [String],
        example: ['u2', 'u3', 'u5']
    })
    @Prop({ type: [String], required: false })
    upvotes?: string[];

    @ApiProperty({
        description: 'Lista de IDs de usuarios que dieron voto negativo',
        required: false,
        type: [String],
        example: ['u6']
    })
    @Prop({ type: [String], required: false })
    downvotes?: string[];

    @ApiProperty({
        description: 'Número de visualizaciones de la rutina',
        example: 1240
    })
    @Prop({ default: 0 })
    views: number;

    @ApiProperty({
        description: 'Indica si la rutina ha sido eliminada (borrado lógico)',
        example: false
    })
    @Prop({ default: false })
    deleted: boolean;

    @ApiProperty({
        description: 'ID único de la rutina (generado automáticamente por MongoDB)',
        example: '69f7d7dbd2f0941fab0fb0f5'
    })
    id?: string;
}

export const RutinaSchema = SchemaFactory.createForClass(Rutina);

RutinaSchema.virtual('id').get(function() {
    return this._id?.toString();
});
