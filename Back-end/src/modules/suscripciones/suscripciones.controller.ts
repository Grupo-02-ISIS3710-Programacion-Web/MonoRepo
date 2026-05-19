import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { SuscripcionesService } from './suscripciones.service';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';

@ApiTags('Suscripciones')
@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private readonly suscripcionesService: SuscripcionesService) {}

  @Get('merchant-info')
  @ApiOperation({ summary: 'Obtener información del comercio (Wompi)' })
  @ApiResponse({ status: 200, description: 'Información del comercio' })
  getMerchantInfo() {
    return this.suscripcionesService.getMerchantInfo();
  }

  @Post()
  @ApiOperation({ summary: 'Crear una suscripción premium' })
  @ApiBody({ type: CreateSuscripcionDto })
  @ApiResponse({ status: 201, description: 'Suscripción creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createSuscripcionDto: CreateSuscripcionDto) {
    return this.suscripcionesService.create(createSuscripcionDto);
  }

  @Get('status/:userId')
  @ApiOperation({ summary: 'Obtener estado de suscripción de un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario', example: 'u1' })
  @ApiResponse({ status: 200, description: 'Estado de la suscripción' })
  getStatus(@Param('userId') userId: string) {
    return this.suscripcionesService.getStatus(userId);
  }

  @Delete(':paymentSourceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar una suscripción' })
  @ApiParam({ name: 'paymentSourceId', description: 'ID del fuente de pago en Wompi', example: 12345 })
  @ApiResponse({ status: 200, description: 'Suscripción cancelada exitosamente' })
  cancel(@Param('paymentSourceId') paymentSourceId: number) {
    return this.suscripcionesService.cancel(paymentSourceId);
  }

  @Post('charge-all')
  @ApiOperation({ summary: 'Cobrar todas las suscripciones activas' })
  @ApiResponse({ status: 200, description: 'Cobros ejecutados' })
  chargeAll() {
    return this.suscripcionesService.chargeAll();
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook de Wompi', description: 'Endpoint para recibir notificaciones de Wompi sobre eventos de pago' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 201, description: 'Webhook procesado' })
  handleWebhook(@Body() body: any) {
    return this.suscripcionesService.handleWebhook(body);
  }
}
