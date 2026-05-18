import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Suscripcion {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'User',
  })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
  })
  paymentSourceId: number;

  @Prop()
  wompiTransactionId: string;

  @Prop({
    required: true,
    default: 'PENDING',
  })
  status: string;

  @Prop({
    required: true,
  })
  payerEmail: string;

  @Prop({
    required: true,
  })
  transactionAmount: number;

  @Prop({
    default: 'COP',
  })
  currencyId: string;

  @Prop()
  reference: string;

  @Prop({
    default: true,
  })
  active: boolean;
}

export const SuscripcionSchema = SchemaFactory.createForClass(Suscripcion);
