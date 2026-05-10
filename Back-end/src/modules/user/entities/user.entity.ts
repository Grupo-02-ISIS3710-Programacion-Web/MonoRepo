import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class User {

  @Prop({
    required: true,
    minlength: 3,
  })
  name: string;

  @Prop({
    required: true,
  })
  birthDate: Date;

  @Prop({
    required: true,
    unique: true,
  })
  correo: string;

  @Prop({
    required: true,
    minlength: 6,
  })
  password: string;

  @Prop({
    required: true,
    enum: [
      'Seca',
      'Grasa',
      'Mixta',
      'Normal',
      'Sensible',
    ],
  })
  skinType: string;

  @Prop({
    required: true,
  })
  discoverySource: string;

  @Prop({
    required: true,
  })
  usedProductsBefore: boolean;
}

export const UserSchema =
  SchemaFactory.createForClass(User);
