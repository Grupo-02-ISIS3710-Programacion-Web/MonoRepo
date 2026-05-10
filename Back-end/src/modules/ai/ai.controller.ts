import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ChatRequestDto } from './dto/chat-request.dto';

@ApiTags('IA - Rutinas Inteligentes')
@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Post('agent/chat')
  @ApiOperation({
    summary: 'Chat interactivo con IA',
    description: 'Permite una conversación interactiva con la IA para crear, refinar o hacer preguntas sobre rutinas de cuidado de la piel.'
  })
  @ApiBody({ type: ChatRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Respuesta de la IA',
    schema: {
      example: {
        response: 'Para tu piel mixta, te recomiendo empezar con una limpieza suave...'
      }
    }
  })
  async chatWithAI(@Body() dto: ChatRequestDto) {
    this.logger.log(`Solicitud recibida: POST /ai/agent/chat - Usuario ${dto.userId}, ${dto.messages.length} mensajes`);
    try {
      return await this.aiService.chatWithAI({
        userId: dto.userId,
        messages: dto.messages,
        routineContext: dto.routineContext,
      });
    } catch (error) {
      this.logger.error(`Error en POST /ai/agent/chat: ${error.message}`, error.stack);
      throw new HttpException(
        { message: 'Error en la conversación con IA', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('products/sync-embeddings')
  @ApiOperation({
    summary: 'Sincronizar embeddings de productos',
    description: 'Genera embeddings vectoriales para todos los productos que no los tienen. Se ejecuta automáticamente al iniciar la aplicación.'
  })
  @ApiResponse({
    status: 200,
    description: 'Embeddings sincronizados',
    schema: {
      example: {
        message: 'Embeddings sincronizados correctamente',
        synced: 42,
        skipped: 0,
      }
    }
  })
  async syncProductEmbeddings() {
    this.logger.log('Solicitud recibida: POST /ai/products/sync-embeddings');
    try {
      const result = await this.aiService.syncProductEmbeddings();
      this.logger.log(`Embeddings sincronizados: ${result.synced} nuevos, ${result.skipped} con error`);
      return {
        message: 'Embeddings sincronizados correctamente',
        synced: result.synced,
        skipped: result.skipped,
      };
    } catch (error) {
      this.logger.error(`Error en POST /ai/products/sync-embeddings: ${error.message}`, error.stack);
      throw new HttpException(
        { message: 'Error sincronizando embeddings', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
