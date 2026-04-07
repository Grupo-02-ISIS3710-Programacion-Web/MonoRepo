/* eslint-disable @typescript-eslint/require-await */
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ProductService } from '../product/product.service';
import { Category, SkinType } from '../../common/enums/product.enum';

export class ProductSearchTool extends StructuredTool {
  name = 'search_products_by_category';
  description =
    'Search for skincare products by category. Categories include: hidratacion, limpieza, exfoliacion, anti-edad, reparacion, antioxidante.';
  schema = z.object({
    category: z.enum([
      'hidratacion',
      'limpieza',
      'exfoliacion',
      'anti-edad',
      'reparacion',
      'antioxidante',
      'ALL',
    ]),
    limit: z
      .number()
      .optional()
      .describe('Maximum number of results to return'),
  });

  constructor(private productService: ProductService) {
    super();
  }

  async _call(input: {
    category: Category | 'ALL';
    limit?: number;
  }): Promise<string> {
    const products = this.productService.getByCategory(input.category);
    const limited = input.limit
      ? products.slice(0, input.limit)
      : products.slice(0, 5);
    return JSON.stringify(limited);
  }
}

export class ProductSearchBySkinTypeTool extends StructuredTool {
  name = 'search_products_by_skin_type';
  description =
    'Search for skincare products suitable for a specific skin type. Skin types include: normal, seca, grasa, mixta, sensible, acneica, irritada, opaca, texturizada.';
  schema = z.object({
    skin_type: z.enum([
      'normal',
      'seca',
      'grasa',
      'mixta',
      'sensible',
      'acneica',
      'irritada',
      'opaca',
      'texturizada',
    ]),
    limit: z
      .number()
      .optional()
      .describe('Maximum number of products to return'),
  });

  constructor(private productService: ProductService) {
    super();
  }

  async _call(input: { skin_type: SkinType; limit?: number }): Promise<string> {
    const allProducts = this.productService.getAll();
    const matched = allProducts.filter((p) =>
      p.skin_type.includes(input.skin_type),
    );
    const limited = input.limit
      ? matched.slice(0, input.limit)
      : matched.slice(0, 5);
    return JSON.stringify(limited);
  }
}

export class ProductSearchByIngredientTool extends StructuredTool {
  name = 'search_products_by_ingredient';
  description: 'Search for skincare products that contain a specific ingredient or component.';
  schema = z.object({
    ingredient: z.string().describe('The ingredient to search for'),
    limit: z
      .number()
      .optional()
      .describe('Maximum number of products to return'),
  });

  constructor(private productService: ProductService) {
    super();
  }

  async _call(input: { ingredient: string; limit?: number }): Promise<string> {
    const allProducts = this.productService.getAll();
    const normalized = input.ingredient.toLowerCase();
    const matched = allProducts.filter((p) =>
      p.ingredients.some((ing) => ing.toLowerCase().includes(normalized)),
    );
    const limited = input.limit
      ? matched.slice(0, input.limit)
      : matched.slice(0, 5);
    return JSON.stringify(limited);
  }
}

export class ProductGetByIdTool extends StructuredTool {
  name = 'get_product_by_id';
  description: 'Get detailed information about a specific product by its ID.';
  schema = z.object({
    product_id: z.string().describe('The ID of the product to retrieve'),
  });

  constructor(private productService: ProductService) {
    super();
  }

  async _call(input: { product_id: string }): Promise<string> {
    const product = this.productService.getById(input.product_id);
    if (!product) {
      return JSON.stringify({
        error: `Product with ID ${input.product_id} not found`,
      });
    }
    return JSON.stringify(product);
  }
}

export class GetAllProductsTool extends StructuredTool {
  name = 'get_all_products';
  description =
    'Get a list of all available skincare products in the database.';
  schema = z.object({
    limit: z
      .number()
      .optional()
      .describe('Maximum number of products to return'),
  });

  constructor(private productService: ProductService) {
    super();
  }

  async _call(input: { limit?: number }): Promise<string> {
    const allProducts = this.productService.getAll();
    const limited = input.limit
      ? allProducts.slice(0, input.limit)
      : allProducts.slice(0, 10);
    return JSON.stringify(limited);
  }
}
