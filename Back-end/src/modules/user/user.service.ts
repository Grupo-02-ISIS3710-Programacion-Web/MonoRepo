import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from './dto/resgister-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async registerUser(registerDto: RegisterDto) {

    const existingUser = await this.userModel.findOne({
      email: registerDto.email,
    });

    if (existingUser) {
      throw new ConflictException(
        'El correo ya está registrado',
      );
    }

    const newUser = new this.userModel(registerDto);

    return await newUser.save();
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: string) {
    return this.userModel.findById(id).select('-contrasenia').exec();
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
