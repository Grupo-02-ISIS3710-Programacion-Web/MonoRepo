import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @ApiOperation({ summary: 'Cargar datos de prueba', description: 'Inserta datos mock de usuarios, productos y rutinas en la base de datos' })
  @ApiResponse({ status: 201, description: 'Datos de prueba insertados correctamente' })
  async seed() {
    await this.seedService.seed();
    return { message: 'Datos de prueba insertados correctamente' };
  }
}
