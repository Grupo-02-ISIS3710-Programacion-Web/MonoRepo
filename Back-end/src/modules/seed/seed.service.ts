import { Inject, Injectable } from '@nestjs/common';
import { Producto } from '../productos/entities/producto.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { productosMock } from 'src/mocks/productos-mock';
@Injectable()
export class SeedService {

    constructor(
        @InjectModel('Producto') private readonly productoModel: Model<Producto>,
    ) { }

    async seed() {
        this.productoModel.deleteMany({});
        await this.productoModel.insertMany(productosMock);
    }

}