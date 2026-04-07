import { Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { productosMock } from 'src/mocks/productos-mock';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductosService {
  create(createProductoDto: CreateProductoDto) {
    const producto = new Producto();

    producto.id = String(productosMock.length + 1);
    producto.name = createProductoDto.name;
    producto.brand = createProductoDto.brand;
    producto.description = createProductoDto.description;
    producto.skin_type = createProductoDto.skin_type;
    producto.product_type = createProductoDto.product_type as any;
    producto.category = [createProductoDto.primary_category, ...(createProductoDto.additional_categories || [])];
    producto.ingredients = createProductoDto.ingredients;
    producto.rating = 0;
    producto.review_count = 0;
    producto.image_url = createProductoDto.image_url;

    productosMock.push(producto);
    return producto;
  }

  findAll() {
    return productosMock;
  }

  findOne(id: number) {
    return productosMock.find((producto) => producto.id === String(id));
  }

  update(id: number, updateProductoDto: UpdateProductoDto) {
    return `This action updates a #${id} producto`;
  }

  remove(id: number) {
    return `This action removes a #${id} producto`;
  }
}
