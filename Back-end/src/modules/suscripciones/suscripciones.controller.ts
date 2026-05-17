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

  @Post()
  create(@Body() createSuscripcionDto: CreateSuscripcionDto) {
    return this.suscripcionesService.create(createSuscripcionDto);
  }

  @Get('status/:userId')
  getStatus(@Param('userId') userId: string) {
    return this.suscripcionesService.getStatus(userId);
  }

  @Delete(':preapprovalId')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('preapprovalId') preapprovalId: string) {
    return this.suscripcionesService.cancel(preapprovalId);
  }

  @Post('webhook')
  handleWebhook(@Body() body: any, @Req() req: any) {
    return this.suscripcionesService.handleWebhook(body, req.query);
  }
}
