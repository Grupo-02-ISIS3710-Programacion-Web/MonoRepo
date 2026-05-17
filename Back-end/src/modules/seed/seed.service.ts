import { Inject, Injectable } from '@nestjs/common';
import { Producto } from '../productos/entities/producto.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { productosMock } from '../../mocks/productos-mock';
import { rutinasMock } from '../../mocks/rutinas-mock';
import { Rutina } from '../rutinas/entities/rutina.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel('Producto') private readonly productoModel: Model<Producto>,
    @InjectModel('Rutina') private readonly rutinaModel: Model<Rutina>,
  ) {}

  async seed() {
    await this.productoModel.deleteMany({});
    await this.productoModel.insertMany(productosMock);

    await this.rutinaModel.deleteMany({});
    await this.rutinaModel.insertMany(rutinasMock);
  }
}
