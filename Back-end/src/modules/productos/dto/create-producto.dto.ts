import { Type } from 'class-transformer';
export class CreateProductoDto {
  name: string;
  brand: string;
  @Type(() => Number)
  skin_type: number[];
  description: string;
  @Type(() => Number)
  product_type: number;
  @Type(() => Number)
  primary_category: number;
  @Type(() => Number)
  additional_categories?: number[];
  ingredients: string[];
}
