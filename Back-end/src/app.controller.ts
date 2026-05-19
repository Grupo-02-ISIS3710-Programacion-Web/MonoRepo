import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Endpoint de verificación de salud del servidor' })
  @ApiResponse({ status: 200, description: 'Servidor funcionando correctamente' })
  getHello(): string {
    return this.appService.getHello();
  }
}
