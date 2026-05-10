import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatCohere, CohereEmbeddings } from '@langchain/cohere';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Producto } from '../productos/entities/producto.entity';
import { CHAT_SYSTEM_PROMPT } from './prompts/routine-prompt.template';

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private chatModel: ChatCohere;
  private embeddings: CohereEmbeddings;
  private availableProducts: any[] = [];

  constructor(
    private configService: ConfigService,
    @InjectModel('Producto') private productoModel: Model<Producto>,
    @InjectModel('SkinTypeCatalog')
    private readonly skinTypeCatalogModel: Model<any>,
    @InjectModel('ProductTypeCatalog')
    private readonly productTypeCatalogModel: Model<any>,
    @InjectModel('CategoryCatalog')
    private readonly categoryCatalogModel: Model<any>,
  ) { }

  async onModuleInit() {
    const apiKey = this.configService.get<string>('COHERE_API_KEY');
    if (!apiKey) {
      this.logger.error('COHERE_API_KEY no está configurada en las variables de entorno');
      throw new Error('COHERE_API_KEY no está configurada en las variables de entorno');
    }

    this.chatModel = new ChatCohere({
      apiKey: apiKey,
      model: 'command-a-03-2025',
      temperature: 0.7,
    });

    this.embeddings = new CohereEmbeddings({
      apiKey: apiKey,
      model: 'embed-v4.0',
    });

    this.logger.log('Sincronizando embeddings de productos...');
    try {
      const result = await this.syncProductEmbeddings();
      this.logger.log(`Embeddings sincronizados: ${result.synced} nuevos, ${result.skipped} con error`);
    } catch (error) {
      this.logger.error('Error sincronizando embeddings en init:', error.message);
    }
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
      this.logger.debug(`Productos cargados: ${this.availableProducts.length} disponibles`);
    } catch (error) {
      this.logger.error(`Error cargando productos: ${error.message}`, error.stack);
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
  }): Promise<{
    response: string;
    recommendedProducts?: { productId: string; reason: string; otherAlternatives?: { id: string; reason: string }[] }[];
    draftUpdate?: { steps?: { productId: string; name: string; notes: string }[] };
  }> {
    this.logger.log(`Chat IA - usuario ${params.userId}: ${params.messages.length} mensajes en historial, ${params.routineContext?.currentSteps?.length || 0} pasos en rutina actual`);
    await this.loadAvailableProducts();

    const langchainMessages: (SystemMessage | HumanMessage)[] = [
      new SystemMessage(CHAT_SYSTEM_PROMPT),
    ];

    // Agregar contexto de productos disponibles
    if (this.availableProducts.length > 0) {
      const productContext = `Productos disponibles en la tienda: ${this.formatProductsForPrompt(this.availableProducts.slice(0, 20))}`;
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
      const content = response.content.toString();

      // Parse JSON response
      try {
        const parsed = this.parseJsonResponse(content);

        // Validate product IDs and return simplified response (IDs only, no product details)
        const validProductIds = new Set(this.availableProducts.map(p => p.id));

        const recommendedProducts = (parsed.recommendedProducts || [])
          .filter((p: any) => validProductIds.has(p.productId))
          .map((p: any) => {
            const alternatives = (p.otherAlternatives || [])
              .filter((alt: any) => validProductIds.has(alt.id))
              .map((alt: any) => ({
                id: alt.id,
                reason: alt.reason || 'Alternativa recomendada',
              }));
            return {
              productId: p.productId,
              reason: p.reason || 'Producto recomendado',
              otherAlternatives: alternatives,
            };
          });

        const draftUpdate = parsed.draftUpdate || undefined;
        if (draftUpdate?.steps) {
          draftUpdate.steps = draftUpdate.steps.filter((step: any) => validProductIds.has(step.productId));
        }

        this.logger.log(`Chat IA - respuesta enviada: ${recommendedProducts.length} productos recomendados${draftUpdate?.steps?.length ? `, ${draftUpdate.steps.length} pasos actualizados en borrador` : ''}`);
        return {
          response: parsed.message || content,
          recommendedProducts: recommendedProducts.length > 0 ? recommendedProducts : undefined,
          draftUpdate
        };
      } catch (parseError) {
        // If JSON parsing fails, return the raw text as message
        this.logger.warn('No se pudo parsear JSON de respuesta IA, devolviendo como texto plano');
        return { response: content };
      }
    } catch (error) {
      this.logger.error(`Error en chat con IA: ${error.message}`, error.stack);
      throw new Error(`Error en la conversación: ${error.message}`);
    }
  }

  // Helper methods for embeddings
  private async loadCatalogCodes(model: Model<any>, ids: number[]): Promise<string[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    const docs = await model.find({ _id: { $in: ids } }).exec();
    return docs.map(doc => doc.code);
  }

  private async generateEmbeddingText(product: any): Promise<string> {
    const categoryCodes = await this.loadCatalogCodes(
      this.categoryCatalogModel,
      product.category || [],
    );

    const skinTypeCodes = await this.loadCatalogCodes(
      this.skinTypeCatalogModel,
      product.skin_type || [],
    );

    let productTypeCode = product.product_type;
    if (typeof product.product_type === 'number') {
      const productTypeCodes = await this.loadCatalogCodes(
        this.productTypeCatalogModel,
        [product.product_type],
      );
      productTypeCode = productTypeCodes[0] || product.product_type;
    }

    const ingredients = (product.ingredients || []).join(', ');

    return `Name: ${product.name || ''}
Brand: ${product.brand || ''}
Description: ${product.description || ''}
Product Type: ${productTypeCode || ''}
Categories: ${categoryCodes.join(', ')}
Skin Types: ${skinTypeCodes.join(', ')}
Key Ingredients: ${ingredients}`;
  }

  // Embedding methods
  async generateProductEmbedding(product: any): Promise<number[]> {
    const text = await this.generateEmbeddingText(product);
    const embedding = await this.embeddings.embedQuery(text);
    return embedding;
  }

  async syncProductEmbeddings(): Promise<{ synced: number; skipped: number }> {
    let synced = 0;
    let skipped = 0;

    const products = await this.productoModel.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } },
        { embedding: null },
      ],
      deleted: { $ne: true },
    }).exec();

    this.logger.log(`Generando embeddings para ${products.length} productos sin embedding`);

    for (const product of products) {
      try {
        const embedding = await this.generateProductEmbedding(product);
        await this.productoModel.findByIdAndUpdate(product._id, {
          $set: { embedding: embedding },
        }).exec();
        synced++;
      } catch (error) {
        this.logger.error(`Error generando embedding para producto ${product._id}: ${error.message}`, error.stack);
        skipped++;
      }
    }

    this.logger.log(`Embeddings finalizados: ${synced} sincronizados, ${skipped} con error`);
    return { synced, skipped };
  }
}
