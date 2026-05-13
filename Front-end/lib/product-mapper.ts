import { Category, SkinType, ProductType } from '@/types/product';

// Mapeo de enums strings a IDs numéricos (debe coincidir con el backend)
const SKIN_TYPE_MAP: Record<SkinType, number> = {
  [SkinType.NORMAL]: 1,
  [SkinType.SECA]: 2,
  [SkinType.GRASA]: 3,
  [SkinType.MIXTA]: 4,
  [SkinType.SENSIBLE]: 5,
  [SkinType.ACNEICA]: 6,
  [SkinType.IRRITADA]: 7,
  [SkinType.OPACA]: 8,
  [SkinType.TEXTURIZADA]: 9,
};

const PRODUCT_TYPE_MAP: Record<ProductType, number> = {
  [ProductType.CREAM]: 1,
  [ProductType.CLEANSER]: 2,
  [ProductType.EYE_CREAM]: 3,
  [ProductType.MASK]: 4,
  [ProductType.OIL]: 5,
  [ProductType.SERUM]: 6,
  [ProductType.ESSENCE]: 7,
  [ProductType.EXFOLIANT]: 8,
  [ProductType.SUNSCREEN]: 9,
  [ProductType.TONER]: 10,
  [ProductType.GEL]: 11,
  [ProductType.BALM]: 12,
  [ProductType.TREATMENT]: 13,
  [ProductType.MAKEUP_REMOVER]: 14,
  [ProductType.MAKEUP]: 15,
};

const CATEGORY_MAP: Record<Category, number> = {
  [Category.HIDRATACION]: 1,
  [Category.LIMPIEZA]: 2,
  [Category.EXFOLIACION]: 3,
  [Category.ANTI_EDAD]: 4,
  [Category.REPARACION]: 5,
  [Category.ANTIOXIDANTE]: 6,
};

export function skinTypeToId(skinType: SkinType): number {
  return SKIN_TYPE_MAP[skinType];
}

export function productTypeToId(productType: ProductType): number {
  return PRODUCT_TYPE_MAP[productType];
}

export function categoryToId(category: Category): number {
  return CATEGORY_MAP[category];
}

export function normalizeProductForSubmission(product: any) {
  return {
    name: product.name,
    brand: product.brand,
    description: product.description,
    skin_type: (product.skin_type || []).map(skinTypeToId),
    product_type: productTypeToId(product.product_type),
    primary_category: categoryToId(product.primary_category),
    additional_categories: (product.additional_categories || []).map(categoryToId),
    ingredients: product.ingredients,
  };
}