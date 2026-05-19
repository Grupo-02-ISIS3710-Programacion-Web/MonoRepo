import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SkinType } from '../../../enums/enums';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    required: true,
    minlength: 3,
    trim: true,
  })
  nombre: string;

  @Prop({
    required: true,
  })
  fechaNacimiento: Date;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: true,
    minlength: 8,
  })
  contrasenia: string;

  @Prop({
    required: true,
    enum: Object.values(SkinType),
  })
  tipoPiel: SkinType;

  @Prop({
    required: true,
    trim: true,
  })
  comoEnteroDeNosotros: string;

  @Prop({
    required: true,
  })
  probadoSkinCare: boolean;

  @Prop({
    trim: true,
    default: '',
  })
  ciudad: string;

  @Prop({
    trim: true,
    default: '',
    maxlength: 300,
  })
  bio: string;

  @Prop({
    default: '',
  })
  avatarUrl: string;

  @Prop({ type: [Types.ObjectId], ref: 'Rutina', default: [] })
  createdRoutineIds: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  favoriteProductIds: string[];

  @Prop({
    default: 0,
    min: 0,
  })
  reviewCount: number;

  @Prop({
    default: false,
  })
  isPremium: boolean;

  @Prop({
    default: null,
  })
  paymentSourceId: number;

  @Prop({
    default: null,
  })
  subscriptionStatus: string;
}

const UserSchemaRaw = SchemaFactory.createForClass(User);

UserSchemaRaw.set('toJSON', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.name = ret.nombre;
    delete ret.contrasenia;
    return ret;
  },
});

export const UserSchema = UserSchemaRaw;
