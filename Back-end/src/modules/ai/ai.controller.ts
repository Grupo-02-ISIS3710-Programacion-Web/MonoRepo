import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateRoutineDto } from './dto/generate-routine.dto';
import { SuggestProductsDto } from './dto/suggest-products.dto';
import { ChatRequestDto } from './dto/chat-request.dto';

@ApiTags('IA - Rutinas Inteligentes')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('routines/generate')
  @ApiOperation({
    summary: 'Generar rutina con IA',
    description: 'Genera una rutina personalizada de cuidado de la piel usando LangChain y Cohere, basada en el tipo de piel y preferencias del usuario. Las rutinas generadas utilizan productos del catálogo disponible (cargado con /seed).'
  })
  @ApiBody({ type: GenerateRoutineDto })
  @ApiResponse({
    status: 201,
    description: 'Rutina generada exitosamente',
    schema: {
      example: {
        name: 'Rutina matutina para piel mixta',
        description: 'Rutina de 4 pasos que equilibra la hidratación y control de sebo',
        steps: [
          {
            id: 'ai_1715000000000_0',
            name: 'Limpieza suave',
            productId: '12',
            notes: 'Aplicar sobre piel húmeda, masajear suavemente',
            order: 0
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 500, description: 'Error al generar la rutina con IA' })
  async generateRoutine(@Body() dto: GenerateRoutineDto) {
    try {
      return await this.aiService.generateRoutine({
        userId: dto.userId,
        skinType: dto.skinType,
        type: dto.type as 'am' | 'pm',
        concerns: dto.concerns,
        stepCount: dto.stepCount,
        preferredProductIds: dto.preferredProductIds,
      });
    } catch (error) {
      throw new HttpException(
        { message: 'Error al generar rutina con IA', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('products/suggest')
  @ApiOperation({
    summary: 'Sugerir productos para un paso',
    description: 'Sugiere productos adecuados para un paso específico de la rutina, basándose en el tipo de piel y categoría deseada.'
  })
  @ApiBody({ type: SuggestProductsDto })
  @ApiResponse({
    status: 200,
    description: 'Sugerencias de productos obtenidas exitosamente',
    schema: {
      example: {
        suggestions: [
          { productId: '12', reason: 'Limpiador suave ideal para piel mixta' },
          { productId: '5', reason: 'Hidratante ligera sin aceite' }
        ]
      }
    }
  })
  async suggestProducts(@Body() dto: SuggestProductsDto) {
    try {
      return await this.aiService.suggestProducts({
        skinType: dto.skinType,
        stepName: dto.stepName,
        category: dto.category,
        concerns: dto.concerns,
      });
    } catch (error) {
      throw new HttpException(
        { message: 'Error al sugerir productos', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

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
    try {
      return await this.aiService.chatWithAI({
        userId: dto.userId,
        messages: dto.messages,
        routineContext: dto.routineContext,
      });
    } catch (error) {
      throw new HttpException(
        { message: 'Error en la conversación con IA', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('agent/search')
  @ApiOperation({
    summary: 'Búsqueda inteligente de productos',
    description: 'Realiza una búsqueda semántica de productos usando IA basada en una consulta en lenguaje natural.'
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados de búsqueda',
    schema: {
      example: {
        results: [
          {
            product: { id: '12', name: 'Cleanser Suave', brand: 'Marca X' },
            relevance: 'Ideal para limpieza diaria de piel mixta'
          }
        ]
      }
    }
  })
  async searchWithAI(
    @Body('query') query: string,
    @Body('skinType') skinType?: string,
  ) {
    try {
      return await this.aiService.searchWithAI(query, skinType);
    } catch (error) {
      throw new HttpException(
        { message: 'Error en búsqueda con IA', error: error.message },
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
    try {
      const result = await this.aiService.syncProductEmbeddings();
      return {
        message: 'Embeddings sincronizados correctamente',
        synced: result.synced,
        skipped: result.skipped,
      };
    } catch (error) {
      throw new HttpException(
        { message: 'Error sincronizando embeddings', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
