import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatCohere } from '@langchain/community/chat_models/cohere';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Rutina } from '../rutinas/entities/rutina.entity';
import { Producto } from '../productos/entities/producto.entity';
import {
  ROUTINE_GENERATION_PROMPT,
  PRODUCT_SUGGESTION_PROMPT,
  CHAT_SYSTEM_PROMPT,
} from './prompts/routine-prompt.template';

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private chatModel: ChatCohere;
  private availableProducts: any[] = [];

  constructor(
    private configService: ConfigService,
    @InjectModel('Rutina') private rutinaModel: Model<Rutina>,
    @InjectModel('Producto') private productoModel: Model<Producto>,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('COHERE_API_KEY');
    if (!apiKey) {
      this.logger.error('COHERE_API_KEY no está configurada en las variables de entorno');
      throw new Error('COHERE_API_KEY no está configurada en las variables de entorno');
    }

    this.chatModel = new ChatCohere({
      apiKey: apiKey,
      model: 'command-r-plus',
      temperature: 0.7,
    });
  }

  /**
   * Carga los productos disponibles desde la base de datos
   */
  private async loadAvailableProducts(): Promise<void> {
    try {
      const products = await this.productoModel.find({ deleted: { $ne: true } }).exec();
      this.availableProducts = products.map(p => ({
        id: p._id?.toString(),
        name: p.name,
        brand: p.brand,
        description: p.description,
        skin_type: p.skin_type,
        product_type: p.product_type,
        category: p.category,
        ingredients: p.ingredients?.slice(0, 5) || [],
      }));
    } catch (error) {
      this.logger.error('Error cargando productos:', error);
      this.availableProducts = [];
    }
  }

  /**
   * Formatea la lista de productos para el prompt
   */
  private formatProductsForPrompt(products: any[]): string {
    if (!products || products.length === 0) {
      return 'No hay productos disponibles.';
    }

    return products
      .map(
        (p, i) =>
          `${i + 1}. ID: ${p.id} | ${p.name} (${p.brand}) | Tipo: ${p.product_type} | Categoría: ${p.category} | Piel: ${p.skin_type?.join(', ')} | Ingredientes: ${p.ingredients?.join(', ')}`
      )
      .join('\n');
  }

  /**
   * Parsea la respuesta JSON de Cohere de manera segura
   */
  private parseJsonResponse(response: string): any {
    try {
      let cleaned = response.trim();
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start === -1 || end === -1) {
        throw new Error('No se encontró JSON válido en la respuesta');
      }
      const jsonStr = cleaned.substring(start, end + 1);
      return JSON.parse(jsonStr);
    } catch (error) {
      this.logger.error('Error parseando respuesta de IA:', error);
      this.logger.debug('Respuesta original:', response);
      throw new Error('La IA no devolvió un formato JSON válido');
    }
  }

  /**
   * Genera una rutina completa basada en las preferencias del usuario
   */
  async generateRoutine(params: {
    userId: string;
    skinType: string;
    type: 'am' | 'pm';
    concerns?: string[];
    stepCount?: number;
    preferredProductIds?: string[];
  }): Promise<{
    name: string;
    description: string;
    steps: { name: string; productId: string; notes: string }[];
  }> {
    await this.loadAvailableProducts();

    const filteredProducts = this.availableProducts.filter(p => {
      const matchesSkinType = p.skin_type?.includes(params.skinType) || p.skin_type?.includes('all');
      const matchesPreferred = !params.preferredProductIds?.length || 
        params.preferredProductIds.includes(p.id);
      return matchesSkinType && matchesPreferred;
    });

    const productList = this.formatProductsForPrompt(
      filteredProducts.length > 0 ? filteredProducts : this.availableProducts.slice(0, 20)
    );

    const prompt = ROUTINE_GENERATION_PROMPT
      .replace('{skinType}', params.skinType)
      .replace('{type}', params.type)
      .replace('{concerns}', params.concerns?.join(', ') || 'general')
      .replace('{stepCount}', String(params.stepCount || 3))
      .replace('{availableProducts}', productList);

    try {
      const response = await this.chatModel.invoke([new HumanMessage(prompt)]);
      const content = response.content.toString();
      const parsed = this.parseJsonResponse(content);

      const steps = (parsed.steps || []).map((step: any, index: number) => ({
        id: `ai_${Date.now()}_${index}`,
        name: step.name || `Paso ${index + 1}`,
        productId: step.productId || '',
        notes: step.notes || '',
        order: index,
      }));

      return {
        name: parsed.name || `Rutina ${params.type === 'am' ? 'de mañana' : 'de noche'}`,
        description: parsed.description || 'Rutina generada por IA',
        steps,
      };
    } catch (error) {
      this.logger.error('Error generando rutina con IA:', error);
      throw new Error(`Error al generar rutina: ${error.message}`);
    }
  }

  /**
   * Sugiere productos para un paso específico de la rutina
   */
  async suggestProducts(params: {
    skinType: string;
    stepName: string;
    category?: string;
    concerns?: string[];
  }): Promise<{ suggestions: { productId: string; reason: string }[] }> {
    await this.loadAvailableProducts();

    let filteredProducts = this.availableProducts.filter(p => {
      const matchesSkinType = p.skin_type?.includes(params.skinType) || p.skin_type?.includes('all');
      const matchesCategory = !params.category || p.category?.includes(params.category);
      return matchesSkinType && matchesCategory;
    });

    if (filteredProducts.length === 0) {
      filteredProducts = this.availableProducts.slice(0, 15);
    }

    const productList = this.formatProductsForPrompt(filteredProducts.slice(0, 15));

    const prompt = PRODUCT_SUGGESTION_PROMPT
      .replace('{skinType}', params.skinType)
      .replace('{stepName}', params.stepName)
      .replace('{category}', params.category || 'cualquiera')
      .replace('{concerns}', params.concerns?.join(', ') || 'general')
      .replace('{availableProducts}', productList);

    try {
      const response = await this.chatModel.invoke([new HumanMessage(prompt)]);
      const content = response.content.toString();
      const parsed = this.parseJsonResponse(content);

      return {
        suggestions: (parsed.suggestions || []).slice(0, 4).map((s: any) => ({
          productId: s.productId || '',
          reason: s.reason || 'Producto adecuado para este paso',
        })),
      };
    } catch (error) {
      this.logger.error('Error sugiriendo productos:', error);
      return { suggestions: [] };
    }
  }

  /**
   * Chat interactivo para ayudar a crear/refinar rutinas
   */
  async chatWithAI(params: {
    userId: string;
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
    routineContext?: {
      skinType?: string;
      type?: string;
      currentSteps?: any[];
    };
  }): Promise<{ response: string }> {
    await this.loadAvailableProducts();

    const langchainMessages: (SystemMessage | HumanMessage)[] = [
      new SystemMessage(CHAT_SYSTEM_PROMPT),
    ];

    // Agregar contexto de productos disponibles
    if (this.availableProducts.length > 0) {
      const productContext = `Productos disponibles en la tienda (muestra): ${this.formatProductsForPrompt(this.availableProducts.slice(0, 10))}`;
      langchainMessages.push(new SystemMessage(productContext));
    }

    // Agregar contexto de la rutina actual
    if (params.routineContext) {
      const routineContextMsg = `Contexto de la rutina actual: ${JSON.stringify(params.routineContext)}`;
      langchainMessages.push(new SystemMessage(routineContextMsg));
    }

    // Agregar historial de mensajes
    for (const msg of params.messages) {
      if (msg.role === 'user') {
        langchainMessages.push(new HumanMessage(msg.content));
      } else {
        langchainMessages.push(new SystemMessage(msg.content));
      }
    }

    try {
      const response = await this.chatModel.invoke(langchainMessages);
      return { response: response.content.toString() };
    } catch (error) {
      this.logger.error('Error en chat con IA:', error);
      throw new Error(`Error en la conversación: ${error.message}`);
    }
  }

  /**
   * Búsqueda inteligente de productos usando IA
   */
  async searchWithAI(query: string, skinType?: string): Promise<{ results: any[] }> {
    await this.loadAvailableProducts();

    let searchProducts = this.availableProducts;
    if (skinType) {
      searchProducts = searchProducts.filter(
        p => p.skin_type?.includes(skinType) || p.skin_type?.includes('all')
      );
    }

    const productList = this.formatProductsForPrompt(searchProducts.slice(0, 30));

    const prompt = `
El usuario busca: "${query}"

Productos disponibles:
${productList}

Instrucciones: Selecciona los 5 productos más relevantes para la búsqueda del usuario.
Responde SOLO en formato JSON:

{
  "results": [
    {
      "productId": "ID del producto",
      "relevance": "Por qué es relevante para la búsqueda"
    }
  ]
}
`;

    try {
      const response = await this.chatModel.invoke([new HumanMessage(prompt)]);
      const content = response.content.toString();
      const parsed = this.parseJsonResponse(content);

      const results = (parsed.results || []).map((r: any) => {
        const product = this.availableProducts.find(p => p.id === r.productId);
        return {
          product: product || null,
          relevance: r.relevance || 'Producto coincidente',
        };
      }).filter((r: any) => r.product !== null);

      return { results: results.slice(0, 5) };
    } catch (error) {
      this.logger.error('Error en búsqueda con IA:', error);
      return { results: [] };
    }
  }
}
