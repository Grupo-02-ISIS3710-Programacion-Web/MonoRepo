import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { RegisterDto } from './dto/register-auth.dto';
import { LoginUserDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  private getJwtToken(payload: any) {
    return this.jwtService.sign(payload);
  }

  async register(RegisterAuthDto: RegisterDto) {
    try {
      const { contrasenia, confirmarContrasenia, ...userData } =
        RegisterAuthDto;

      const user = new this.userModel({
        ...userData,
        contrasenia: bcrypt.hashSync(contrasenia, 10),
      });

      await user.save();

      const { contrasenia: _, ...userWithoutPassword } = user.toObject();

      return {
        ...userWithoutPassword,

        token: this.getJwtToken({
          id: user.id,
          email: user.email,
        }),
      };
    } catch (error) {
      throw this.handleBDErrors(error);
    }
  }

  async login(loginDto: LoginUserDto) {
    try {
      const email = loginDto.email.toLowerCase();

      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new BadRequestException('Credenciales inválidas');
      }

      const isPasswordValid = bcrypt.compareSync(
        loginDto.contrasenia,
        user.contrasenia,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Credenciales inválidas');
      }

      const { contrasenia, ...userWithoutPassword } = user.toObject();

      return {
        user: userWithoutPassword,

        token: this.getJwtToken({
          id: user.id,
          email: user.email,
        }),
      };
    } catch (error) {
      this.handleBDErrors(error);
    }
  }

  private handleBDErrors(error: any): never {
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        throw new BadRequestException('Este correo ya está registrado');
      }

      throw new BadRequestException('Ya existe un registro con esos datos');
    }

    if (error.name === 'ValidationError') {
      throw new BadRequestException('Los datos enviados no son válidos');
    }

    console.error(error);

    throw new InternalServerErrorException('Ocurrió un error inesperado');
  }

  async profile(userId: string) {

  const user = await this.userModel
    .findById(userId)
    .select('-contrasenia');

  return user;
}
}
