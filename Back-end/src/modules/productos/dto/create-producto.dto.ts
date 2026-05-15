import { Transform } from 'class-transformer';

export class CreateProductoDto {
  name: string;
  brand: string;
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map(String)
      : typeof value === 'string'
        ? value
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : [],
  )
  skin_type: string[];
  description: string;
  product_type: string;
  primary_category: string;
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map(String)
      : typeof value === 'string'
        ? value
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : [],
  )
  additional_categories?: string[];
  ingredients: string[];
}
