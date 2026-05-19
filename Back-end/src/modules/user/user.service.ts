import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async findAll() {
    const users = await this.userModel.find().select('-contrasenia').exec();
    return users;
  }

  async findOne(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-contrasenia')
      .exec();

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-contrasenia')
      .exec();

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    return user;
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    return { message: 'Usuario eliminado correctamente' };
  }

  async getFavorites(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('favoriteProductIds')
      .exec();

    if (!user) {
      throw new NotFoundException(
        `Usuario con id ${userId} no encontrado`,
      );
    }

    return user.favoriteProductIds ?? [];
  }

  async addFavorite(userId: string, productId: string) {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $addToSet: {
            favoriteProductIds: productId,
          },
        },
        { new: true },
      )
      .select('-contrasenia')
      .exec();

    if (!user) {
      throw new NotFoundException(
        `Usuario con id ${userId} no encontrado`,
      );
    }

    return user;
  }

  async removeFavorite(userId: string, productId: string) {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $pull: {
            favoriteProductIds: productId,
          },
        },
        { new: true },
      )
      .select('-contrasenia')
      .exec();

    if (!user) {
      throw new NotFoundException(
        `Usuario con id ${userId} no encontrado`,
      );
    }

    return user;
  }
}