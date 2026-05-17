import { BadRequestException } from '@nestjs/common';
import { SkinTypeCatalog } from 'src/schema/catalog.schema';

export enum Category {
  HIDRATACION = 'hidratacion',
  LIMPIEZA = 'limpieza',
  EXFOLIACION = 'exfoliacion',
  ANTI_EDAD = 'anti-edad',
  REPARACION = 'reparacion',
  ANTIOXIDANTE = 'antioxidante',
}

export enum SkinType {
  NORMAL = 'normal',
  SECA = 'seca',
  GRASA = 'grasa',
  MIXTA = 'mixta',
  SENSIBLE = 'sensible',
  ACNEICA = 'acneica',
  IRRITADA = 'irritada',
  OPACA = 'opaca',
  TEXTURIZADA = 'texturizada',
}

export enum ProductType {
  CREAM = 'cream',
  CLEANSER = 'cleanser',
  EYE_CREAM = 'eye_cream',
  MASK = 'mask',
  OIL = 'oil',
  SERUM = 'serum',
  ESSENCE = 'essence',
  EXFOLIANT = 'exfoliant',
  SUNSCREEN = 'sunscreen',
  TONER = 'toner',
  GEL = 'gel',
  BALM = 'balm',
  TREATMENT = 'treatment',
  MAKEUP_REMOVER = 'makeup_remover',
  MAKEUP = 'makeup',
}

export type CatalogLanguage = 'es' | 'en';

export interface CatalogValueDefinition {
  id: number;
  code: string;
  labels: Record<CatalogLanguage, string>;
}

export const SKIN_TYPE_CATALOG: CatalogValueDefinition[] = [
  { id: 1, code: SkinType.NORMAL, labels: { es: 'normal', en: 'normal' } },
  { id: 2, code: SkinType.SECA, labels: { es: 'seca', en: 'dry' } },
  { id: 3, code: SkinType.GRASA, labels: { es: 'grasa', en: 'oily' } },
  { id: 4, code: SkinType.MIXTA, labels: { es: 'mixta', en: 'combination' } },
  {
    id: 5,
    code: SkinType.SENSIBLE,
    labels: { es: 'sensible', en: 'sensitive' },
  },
  {
    id: 6,
    code: SkinType.ACNEICA,
    labels: { es: 'acneica', en: 'acne-prone' },
  },
  {
    id: 7,
    code: SkinType.IRRITADA,
    labels: { es: 'irritada', en: 'irritated' },
  },
  { id: 8, code: SkinType.OPACA, labels: { es: 'opaca', en: 'dull' } },
  {
    id: 9,
    code: SkinType.TEXTURIZADA,
    labels: { es: 'texturizada', en: 'textured' },
  },
];

export const PRODUCT_TYPE_CATALOG: CatalogValueDefinition[] = [
  { id: 1, code: ProductType.CREAM, labels: { es: 'crema', en: 'cream' } },
  {
    id: 2,
    code: ProductType.CLEANSER,
    labels: { es: 'limpiador', en: 'cleanser' },
  },
  {
    id: 3,
    code: ProductType.EYE_CREAM,
    labels: { es: 'contorno de ojos', en: 'eye cream' },
  },
  { id: 4, code: ProductType.MASK, labels: { es: 'mascarilla', en: 'mask' } },
  { id: 5, code: ProductType.OIL, labels: { es: 'aceite', en: 'oil' } },
  { id: 6, code: ProductType.SERUM, labels: { es: 'serum', en: 'serum' } },
  {
    id: 7,
    code: ProductType.ESSENCE,
    labels: { es: 'esencia', en: 'essence' },
  },
  {
    id: 8,
    code: ProductType.EXFOLIANT,
    labels: { es: 'exfoliante', en: 'exfoliant' },
  },
  {
    id: 9,
    code: ProductType.SUNSCREEN,
    labels: { es: 'protector solar', en: 'sunscreen' },
  },
  { id: 10, code: ProductType.TONER, labels: { es: 'tonico', en: 'toner' } },
  { id: 11, code: ProductType.GEL, labels: { es: 'gel', en: 'gel' } },
  { id: 12, code: ProductType.BALM, labels: { es: 'balsamo', en: 'balm' } },
  {
    id: 13,
    code: ProductType.TREATMENT,
    labels: { es: 'tratamiento', en: 'treatment' },
  },
  {
    id: 14,
    code: ProductType.MAKEUP_REMOVER,
    labels: { es: 'desmaquillante', en: 'makeup remover' },
  },
  {
    id: 15,
    code: ProductType.MAKEUP,
    labels: { es: 'maquillaje', en: 'makeup' },
  },
];

export const CATEGORY_CATALOG: CatalogValueDefinition[] = [
  {
    id: 1,
    code: Category.HIDRATACION,
    labels: { es: 'hidratacion', en: 'hydration' },
  },
  {
    id: 2,
    code: Category.LIMPIEZA,
    labels: { es: 'limpieza', en: 'cleansing' },
  },
  {
    id: 3,
    code: Category.EXFOLIACION,
    labels: { es: 'exfoliacion', en: 'exfoliation' },
  },
  {
    id: 4,
    code: Category.ANTI_EDAD,
    labels: { es: 'anti-edad', en: 'anti-aging' },
  },
  {
    id: 5,
    code: Category.REPARACION,
    labels: { es: 'reparacion', en: 'repair' },
  },
  {
    id: 6,
    code: Category.ANTIOXIDANTE,
    labels: { es: 'antioxidante', en: 'antioxidant' },
  },
];

const CATALOGS: Record<CatalogType, CatalogValueDefinition[]> = {
  skin_type: SKIN_TYPE_CATALOG,
  product_type: PRODUCT_TYPE_CATALOG,
  category: CATEGORY_CATALOG,
};

export type CatalogType = 'skin_type' | 'product_type' | 'category';

export function getCatalogIdByCode(
  catalogType: CatalogType,
  code: string,
): number {
  const catalog = CATALOGS[catalogType];
  const found = catalog.find((item) => item.code === code);
  if (!found) throw new BadRequestException(`Invalid code: ${code}`);
  return found.id;
}
