import { Type, Transform } from 'class-transformer';

export class CreateProductoDto {
  name: string;
  brand: string;
  description: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return value.split(',').map((s: string) => s.trim()); }
    }
    return value;
  })
  skin_type: number[];

  @Type(() => Number)
  product_type: number;

  @Type(() => Number)
  primary_category: number;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return value.split(',').map((s: string) => s.trim()); }
    }
    return value;
  })
  additional_categories?: number[];

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return value.split(',').map((s: string) => s.trim()); }
    }
    return value;
  })
  ingredients: string[];
}