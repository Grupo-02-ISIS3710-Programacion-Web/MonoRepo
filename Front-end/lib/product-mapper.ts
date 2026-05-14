import { Category, SkinType, ProductType, Product } from '@/types/product';

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

const SKIN_TYPE_ID_MAP = Object.fromEntries(
  Object.entries(SKIN_TYPE_MAP).map(([key, value]) => [value, key])
) as Record<number, SkinType>;

const PRODUCT_TYPE_ID_MAP = Object.fromEntries(
  Object.entries(PRODUCT_TYPE_MAP).map(([key, value]) => [value, key])
) as Record<number, ProductType>;

const CATEGORY_ID_MAP = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([key, value]) => [value, key])
) as Record<number, Category>;

export function convertProductApiResponse(product: any):  Product {
  return {
    id: product._id?.toString() || product.id,
    name: product.name,
    brand: product.brand,
    description: product.description,
    skin_type: (product.skin_type || []).map((id: number) => SKIN_TYPE_ID_MAP[id]),
    product_type: PRODUCT_TYPE_ID_MAP[product.product_type],
    category: (product.category || []).map((id: number) => CATEGORY_ID_MAP[id]),
    ingredients: product.ingredients || [],
    rating: product.rating ?? 0,
    review_count: product.review_count ?? 0,
    image_url: product.image_url || [],
    comments: product.comments,
  };
}