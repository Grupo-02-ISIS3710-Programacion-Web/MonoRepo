import { Injectable } from '@nestjs/common';
import { ProductDto } from '../../common/dtos/product.dto';
import { Category } from '../../common/enums/product.enum';
import { MOCK_PRODUCTS } from './product.data';

@Injectable()
export class ProductService {
  private products: ProductDto[] = MOCK_PRODUCTS;

  getAll(): ProductDto[] {
    return this.products;
  }

  getById(id: string): ProductDto | undefined {
    return this.products.find((product) => product.id === id);
  }

  getByName(name: string): ProductDto | undefined {
    const normalizedName = this.normalizeString(name);
    return this.products.find(
      (product) => this.normalizeString(product.name) === normalizedName,
    );
  }

  getByCategory(category: Category | 'ALL'): ProductDto[] {
    if (category === 'ALL') {
      return this.products;
    }
    return this.products.filter((product) =>
      product.category.includes(category),
    );
  }

  private normalizeString(str: string): string {
    return str.trim().toLowerCase().replace(/-/g, ' ');
  }
}
