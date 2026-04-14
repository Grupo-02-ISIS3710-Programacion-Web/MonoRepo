import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductosService {
  constructor(@InjectModel('Producto') private productoModel: Model<Producto>) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const producto = new this.productoModel({
      name: createProductoDto.name,
      brand: createProductoDto.brand,
      description: createProductoDto.description,
      skin_type: createProductoDto.skin_type,
      product_type: createProductoDto.product_type,
      category: [createProductoDto.primary_category, ...(createProductoDto.additional_categories || [])],
      ingredients: createProductoDto.ingredients,
      image_url: createProductoDto.image_url,
      rating: 0,
      review_count: 0,
      deleted: false,
    });
    return await producto.save();
  }

  async findAll(): Promise<Producto[]> {
    return await this.productoModel.find({ deleted: false }).exec();
  }

  async findOne(id: string): Promise<Producto | null> {
    return await this.productoModel.findById(id).exec();
  }

  async update(id: string, updateProductoDto: UpdateProductoDto): Promise<Producto | null> {
    const updateData: any = {};
    
    if (updateProductoDto.name) updateData.name = updateProductoDto.name;
    if (updateProductoDto.brand) updateData.brand = updateProductoDto.brand;
    if (updateProductoDto.description) updateData.description = updateProductoDto.description;
    if (updateProductoDto.skin_type) updateData.skin_type = updateProductoDto.skin_type;
    if (updateProductoDto.product_type) updateData.product_type = updateProductoDto.product_type;
    if (updateProductoDto.ingredients) updateData.ingredients = updateProductoDto.ingredients;
    if (updateProductoDto.image_url) updateData.image_url = updateProductoDto.image_url;
    
    if (updateProductoDto.primary_category) {
      const categories = [updateProductoDto.primary_category];
      if (updateProductoDto.additional_categories) {
        categories.push(...updateProductoDto.additional_categories);
      }
      updateData.category = categories;
    }

    return await this.productoModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string): Promise<{ message: string }> {
    const resultado = await this.productoModel.findByIdAndUpdate(id, { deleted: true }, { new: true }).exec();
    if (resultado) {
      return { message: `Se ha eliminado el producto con id ${id}` };
    }
    return { message: `No se encontró el producto con id ${id}` };
  }
}
