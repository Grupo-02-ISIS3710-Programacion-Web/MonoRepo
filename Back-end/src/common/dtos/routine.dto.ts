import { SkinType } from '../enums/product.enum';
import { CommentDto } from './product.dto';

export class RoutineStepDto {
  id: string;
  name: string;
  order: number;
  productId: string;
  notes?: string;
}

export class RoutineDto {
  id: string;
  userId: string;
  name: string;
  description: string;
  publishedAt?: string;
  type: string;
  skinType: SkinType;
  steps: RoutineStepDto[];
  comments?: CommentDto[];
  upvotes?: string[];
  downvotes?: string[];
  views?: number;
}

export class CreateRoutineDto {
  name: string;
  description: string;
  type: string;
  skinType: SkinType;
  steps: RoutineStepDto[];
}
