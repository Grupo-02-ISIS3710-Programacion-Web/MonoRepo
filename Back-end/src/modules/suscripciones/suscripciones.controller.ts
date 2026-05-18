import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SuscripcionesService } from './suscripciones.service';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';

@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private readonly suscripcionesService: SuscripcionesService) {}

  @Get('merchant-info')
  getMerchantInfo() {
    return this.suscripcionesService.getMerchantInfo();
  }

  @Post()
  create(@Body() createSuscripcionDto: CreateSuscripcionDto) {
    return this.suscripcionesService.create(createSuscripcionDto);
  }

  @Get('status/:userId')
  getStatus(@Param('userId') userId: string) {
    return this.suscripcionesService.getStatus(userId);
  }

  @Delete(':paymentSourceId')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('paymentSourceId') paymentSourceId: number) {
    return this.suscripcionesService.cancel(paymentSourceId);
  }

  @Post('webhook')
  handleWebhook(@Body() body: any) {
    return this.suscripcionesService.handleWebhook(body);
  }
}
