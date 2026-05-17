import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { SuscripcionesService } from './suscripciones.service';
import { SuscripcionesController } from './suscripciones.controller';
import { Suscripcion, SuscripcionSchema } from './entities/suscripcion.entity';
import { User, UserSchema } from '../user/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Suscripcion.name, schema: SuscripcionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    HttpModule,
  ],
  controllers: [SuscripcionesController],
  providers: [SuscripcionesService],
})
export class SuscripcionesModule {}
