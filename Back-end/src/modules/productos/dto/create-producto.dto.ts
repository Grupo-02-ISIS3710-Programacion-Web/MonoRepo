export class CreateProductoDto {
  name: string;
  brand: string;
  skin_type: number[];
  description: string;
  product_type: number;
  primary_category: number;
  additional_categories?: number[];
  ingredients: string[];
}
