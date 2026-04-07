import { Product, SkinType } from "@/types/product";
import { Comment } from "@/types/Comment";

export interface RoutineStep {
  id: string;
  name: string;
  order: number;
  productId: string;
  product?: Product;
  notes?: string;
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description: string;
  publishedAt?: string;
  type: string;
  skinType: SkinType;
  steps: RoutineStep[];
  comments?: Comment[];
  upvotes?: string[];
  downvotes?: string[];
  views?: number;
}