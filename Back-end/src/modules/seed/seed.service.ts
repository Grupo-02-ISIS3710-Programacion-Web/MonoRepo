import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Rutina } from '../rutinas/entities/rutina.entity';
import { productosMock } from '../../mocks/productos-mock';
import { usuariosMock } from '../../mocks/usuarios-mock';
import { rutinasMock } from '../../mocks/rutinas-mock';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel('Producto') private readonly productoModel: Model<Producto>,
    @InjectModel('Rutina') private readonly rutinaModel: Model<Rutina>,
  ) {}

  async seed() {
    this.logger.log('Iniciando siembra de datos de prueba...');

    await this.userModel.deleteMany({});
    const usersWithHashedPasswords = usuariosMock.map((u) => ({
      ...u,
      contrasenia: bcrypt.hashSync(u.contrasenia, 10),
    }));
    await this.userModel.insertMany(usersWithHashedPasswords);
    this.logger.log(`${usuariosMock.length} usuarios insertados`);

    await this.productoModel.deleteMany({});
    await this.productoModel.insertMany(productosMock);
    this.logger.log(`${productosMock.length} productos insertados`);

    await this.rutinaModel.deleteMany({});
    await this.rutinaModel.insertMany(rutinasMock);
    this.logger.log(`${rutinasMock.length} rutinas insertadas`);

    this.logger.log('Siembra de datos completada');
  }
}
