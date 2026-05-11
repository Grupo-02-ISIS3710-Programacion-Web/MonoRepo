import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { RegisterDtoUser } from './dto/register-auth.dto';
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


  async register(createAuthDto: RegisterDtoUser) {
    try {
      const { password, ...userData } = createAuthDto;

      const user = new this.userModel({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await user.save();

      const { password: _, ...userWithoutPassword } =
        user.toObject();

      return {
        ...userWithoutPassword,

        token: this.getJwtToken({
          id: user.id,
          email: user.email,
        }),
      };

    } catch (error) {
      this.handleBDErrors(error);
    }
  }

  async login(loginDto: LoginUserDto) {
    try {
      const email = String(loginDto.email);

      const user = await this.userModel
        .findOne({ email })
        .select('+password +email +name');

      if (!user) {
        throw new BadRequestException(
          'Invalid credentials',
        );
      }

      if (
        !bcrypt.compareSync(
          String(loginDto.password),
          String(user.password),
        )
      ) {
        throw new BadRequestException(
          'Invalid credentials',
        );
      }

      const { password: _, ...userWithoutPassword } =
        user.toObject();

      return {
        ...userWithoutPassword,

        token: this.getJwtToken({
          id: user.id,
          email: user.email,
        }),
      };

    } catch (error) {
      this.handleBDErrors(error);
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }


  private handleBDErrors(error: any): never {
    console.log(error);

    if (error.code === 11000) {
      throw new BadRequestException(error.message);
    }

    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
