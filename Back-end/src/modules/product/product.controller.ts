import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto } from '../../common/dtos/product.dto';
import { Category } from '../../common/enums/product.enum';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  getAllProducts(@Query('category') category?: Category | 'ALL'): ProductDto[] {
    if (category) {
      return this.productService.getByCategory(category);
    }
    return this.productService.getAll();
  }

  @Get('by-id/:id')
  getProductById(@Param('id') id: string): ProductDto | undefined {
    return this.productService.getById(id);
  }

  @Get('by-name/:name')
  getProductByName(@Param('name') name: string): ProductDto | undefined {
    return this.productService.getByName(name);
  }
}
