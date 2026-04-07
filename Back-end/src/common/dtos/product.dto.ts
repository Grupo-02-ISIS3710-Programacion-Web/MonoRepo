import { Category, SkinType, ProductType } from '../enums/product.enum';

export class CommentDto {
  id: string;
  userId: string;
  comment: string;
  createdAt?: string;
  upvotes: string[];
  downvotes: string[];
}

export class ProductDto {
  id: string;
  name: string;
  brand: string;
  description: string;
  skin_type: SkinType[];
  product_type: ProductType;
  category: Category[];
  ingredients: string[];
  rating: number;
  review_count: number;
  image_url: string[];
  comments?: CommentDto[];
}

export class ProposedProductDto {
  name: string;
  brand: string;
  skin_type: SkinType[];
  product_type: string;
  primary_category: Category;
  additional_categories?: Category[];
  ingredients: string[];
  image_url: string[];
}
