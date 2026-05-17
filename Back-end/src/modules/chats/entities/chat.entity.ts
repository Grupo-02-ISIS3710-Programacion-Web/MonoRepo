import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ChatMessage {
  @Prop({ required: true, enum: ['user', 'assistant'] })
  role: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Object, required: false })
  recommendedProducts?: {
    productId: string;
    reason: string;
    otherAlternatives?: { id: string; reason: string }[];
  }[];

  @Prop({ type: Object, required: false })
  draftUpdate?: {
    steps?: { productId: string; name: string; notes: string }[];
  };

  @Prop({ default: Date.now })
  timestamp: Date;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Chat extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: [ChatMessage], default: [] })
  messages: ChatMessage[];

  @Prop({ type: Object, required: false })
  routineDraft?: {
    name: string;
    description: string;
    type: string;
    skinType: string;
    steps: {
      id: string;
      name: string;
      order: number;
      productId: string;
      notes: string;
    }[];
  };

  @Prop({ type: [String], default: [] })
  selectedFocusAreaIds: string[];

  @Prop({ default: false })
  deleted: boolean;

  id?: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

ChatSchema.virtual('id').get(function () {
  return this._id?.toString();
});
