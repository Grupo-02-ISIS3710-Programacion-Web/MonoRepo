import { Type } from 'class-transformer';
export class CreateProductoDto {
  name: string;
  brand: string;
  
  skin_type: number[];
  description: string;
  @Type(() => Number)
  product_type: number;
  @Type(() => Number)
  primary_category: number;
  additional_categories?: number[];
  ingredients: string[];
}
