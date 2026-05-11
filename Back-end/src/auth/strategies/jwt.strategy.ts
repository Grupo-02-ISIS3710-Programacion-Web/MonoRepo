import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {
    super({
      secretOrKey: process.env.JWT_SECRET,

      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: any): Promise<User> {
    const { email } = payload;
    console.log(payload);

    const user = await this.userModel.findOne({
      email,
    });

    if (!user) {
      throw new UnauthorizedException(
        'Token no válido',
      );
    }

    return user;
  }
}