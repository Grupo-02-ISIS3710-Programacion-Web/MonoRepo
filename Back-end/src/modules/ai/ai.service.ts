/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { RoutineService } from '../routine/routine.service';
import { RoutineDto, RoutineStepDto } from '../../common/dtos/routine.dto';
import { SkinType, ProductType } from '../../common/enums/product.enum';

export interface RoutineGenerationRequest {
  userId: string;
  skinType: SkinType;
  routineName: string;
  routineType: 'morning' | 'night' | 'weekly';
  description: string;
  specificNeeds?: string[];
}

export interface AIRoutineResponse {
  routine: RoutineDto;
  reasoning: string;
  productSelectionLogic: string;
}

@Injectable()
export class AIService {
  constructor(
    private productService: ProductService,
    private routineService: RoutineService,
  ) {}

  /**
   * Generate a routine based on user profile and needs using AI logic
   */
  generateRoutineForUser(request: RoutineGenerationRequest): AIRoutineResponse {
    const allProducts = this.productService.getAll();

    // Filter products suitable for the user's skin type
    const suitableProducts = allProducts.filter((p) =>
      p.skin_type.includes(request.skinType),
    );

    // Select products based on routine type and specific needs
    const selectedProducts = this.selectProductsForRoutine(
      suitableProducts,
      request.routineType,
      request.specificNeeds,
    );

    // Create routine steps
    const steps = this.createRoutineSteps(
      selectedProducts,
      request.routineType,
    );

    // Create the routine DTO
    const routine = this.routineService.create(request.userId, {
      name: request.routineName,
      description: request.description,
      type: request.routineType,
      skinType: request.skinType,
      steps,
    });

    return {
      routine,
      reasoning: this.getRoutineReasoning(request, selectedProducts),
      productSelectionLogic: this.getSelectionLogic(
        request.routineType,
        request.specificNeeds,
      ),
    };
  }

  /**
   * Suggest products based on specific skin concerns
   */
  suggestProductsForConcerns(
    skinType: SkinType,
    concerns: string[],
    maxResults: number = 5,
  ): { products: any[]; suggestions: string[] } {
    const allProducts = this.productService.getAll();

    // Filter by skin type first
    const candidates = allProducts.filter((p) =>
      p.skin_type.includes(skinType),
    );

    // Map concerns to relevant attributes
    const concernKeywords: { [key: string]: string[] } = {
      acne: ['acneica', 'oil control', 'exfoliant', 'cleanser'],
      dryness: ['seca', 'moisturizer', 'hydration', 'serum'],
      sensitivity: ['sensible', 'gentle', 'calming', 'balm'],
      'anti-aging': ['anti-edad', 'serum', 'cream', 'retinol'],
      dullness: ['opaca', 'antioxidante', 'brightening', 'exfoliant'],
      texture: ['texturizada', 'exfoliant', 'acid', 'smoothing'],
    };

    // Score and rank candidates based on concerns
    const scoredCandidates = candidates.map((product) => {
      let score = 0;

      for (const concern of concerns) {
        const keywords = concernKeywords[concern.toLowerCase()] || [];
        for (const keyword of keywords) {
          // Check in name, description, and category
          if (
            product.name.toLowerCase().includes(keyword) ||
            product.description.toLowerCase().includes(keyword) ||
            product.category.some((c) =>
              c.toString().toLowerCase().includes(keyword),
            )
          ) {
            score += 2;
          }
        }
      }

      // Bonus for highly-rated products
      if (product.rating >= 4.7) {
        score += 1;
      }

      return { product, score };
    });

    // Sort by score and limit results
    const topProducts = scoredCandidates
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map((item) => item.product);

    const suggestions = this.generateProductSuggestions(
      skinType,
      concerns,
      topProducts,
    );

    return {
      products: topProducts,
      suggestions,
    };
  }

  /**
   * Get personalized routine recommendations
   */
  getRoutineRecommendations(
    skinType: SkinType,
    routineType: 'morning' | 'night',
  ): {
    productSequence: string[];
    tips: string[];
    waitTimes: { [key: string]: string };
  } {
    const recommendations = {
      morning: {
        productSequence: ['cleanser', 'toner', 'serum', 'moisturizer'],
        tips: [
          'Use gentle pressure when applying products',
          'Allow serum to absorb for 1-2 minutes before moisturizer',
          'Apply moisturizer to damp skin for better absorption',
        ],
        waitTimes: {
          cleanser: '2 minutes',
          toner: '1 minute',
          serum: '2 minutes',
          moisturizer: 'immediate',
        },
      },
      night: {
        productSequence: ['cleanser', 'treatment', 'serum', 'moisturizer'],
        tips: [
          'Night routines can include more potent actives',
          'Allow treatment products to set before applying moisturizer',
          'Use richer creams at night for overnight repair',
        ],
        waitTimes: {
          cleanser: '2 minutes',
          treatment: '5-10 minutes',
          serum: '2 minutes',
          moisturizer: 'immediate',
        },
      },
    };

    return recommendations[routineType] || recommendations.morning;
  }

  private selectProductsForRoutine(
    suitableProducts: any[],
    routineType: string,
    specificNeeds?: string[],
  ): any[] {
    const selected: any[] = [];

    // Always start with a cleanser
    const cleanser = suitableProducts.find(
      (p) => p.product_type === ProductType.CLEANSER,
    );
    if (cleanser) selected.push(cleanser);

    // Select based on routine type
    if (routineType === 'morning') {
      // Morning: light serum + moisturizer
      const serum = suitableProducts.find(
        (p) => p.product_type === ProductType.SERUM && p.rating >= 4.5,
      );
      if (serum && !selected.includes(serum)) selected.push(serum);

      const moisturizer = suitableProducts.find(
        (p) => p.product_type === ProductType.CREAM && p.rating >= 4.5,
      );
      if (moisturizer && !selected.includes(moisturizer))
        selected.push(moisturizer);
    } else if (routineType === 'night') {
      // Night: treatment + serum + richer moisturizer
      const treatment = suitableProducts.find(
        (p) =>
          (p.product_type === ProductType.SERUM ||
            p.product_type === ProductType.TREATMENT) &&
          p.rating >= 4.6,
      );
      if (treatment && !selected.includes(treatment)) selected.push(treatment);

      const cream = suitableProducts.find(
        (p) => p.product_type === ProductType.CREAM && p.rating >= 4.7,
      );
      if (cream && !selected.includes(cream)) selected.push(cream);
    }

    // Add products for specific needs
    if (specificNeeds && specificNeeds.length > 0) {
      for (const need of specificNeeds) {
        const matching = suitableProducts.find(
          (p) =>
            !selected.includes(p) &&
            (p.name.toLowerCase().includes(need.toLowerCase()) ||
              p.description.toLowerCase().includes(need.toLowerCase())),
        );
        if (matching) selected.push(matching);
      }
    }

    return selected.slice(0, 5); // Limit to 5 products per routine
  }

  private createRoutineSteps(
    products: any[],
    routineType: string,
  ): RoutineStepDto[] {
    const steps: RoutineStepDto[] = [];
    let order = 1;

    // Define product order based on routine type and product type
    const priorityOrder: { [key: string]: number } = {
      cleanser: 1,
      toner: 2,
      essence: 3,
      treatment: 4,
      serum: 4,
      mask: 5,
      balm: 6,
      cream: 7,
      gel: 7,
      oil: 8,
    };

    // Sort products by priority
    const sortedProducts = products.sort(
      (a, b) =>
        (priorityOrder[a.product_type] || 99) -
        (priorityOrder[b.product_type] || 99),
    );

    for (const product of sortedProducts) {
      steps.push({
        id: `step-${order}`,
        name: product.name,
        order,
        productId: product.id,
        notes: this.getProductNotes(product, routineType, order),
      });
      order++;
    }

    return steps;
  }

  private getProductNotes(
    product: any,
    routineType: string,
    step: number,
  ): string {
    const notes: { [key: string]: string } = {
      cleanser: 'Apply to damp face and massage gently for 30 seconds',
      toner: 'Dispense onto a cotton pad and swipe across face',
      serum:
        'Apply a few drops and pat into skin, wait 1-2 minutes before next step',
      essence: 'Pat into skin until fully absorbed',
      cream: 'Apply in upward motions, focus on dry areas',
      gel: 'Use sparingly, a little goes a long way',
      treatment:
        'Follow product instructions carefully, may need 5-10 minute wait time',
      mask: 'Apply and leave on for 10-20 minutes as directed',
      balm: 'Pat gently until absorbed, especially for sensitive areas',
      oil: 'Use only a few drops, blend with fingertips',
    };

    return notes[product.product_type] || 'Apply as directed on packaging';
  }

  private getRoutineReasoning(
    request: RoutineGenerationRequest,
    selectedProducts: any[],
  ): string {
    return `Created a ${request.routineType} routine for ${request.skinType} skin type with ${selectedProducts.length} carefully selected products. The routine prioritizes ${this.getPriorities(request)} and includes products with excellent ratings and suitable ingredients for your skin type.`;
  }

  private getPriorities(request: RoutineGenerationRequest): string {
    const priorityMap: { [key: string]: string } = {
      morning: 'hydration and protection',
      night: 'repair and nourishment',
      weekly: 'deep cleansing and treatment',
    };
    return priorityMap[request.routineType] || 'skin health';
  }

  private getSelectionLogic(
    routineType: string,
    specificNeeds?: string[],
  ): string {
    let logic = `For ${routineType} routines, products were selected based on: 1) Compatibility with skin type, 2) Product ratings (preferring 4.5+), `;

    if (routineType === 'morning') {
      logic += '3) Lightweight textures suitable for daytime use';
    } else if (routineType === 'night') {
      logic += '3) Treatment and repair potential for overnight regeneration';
    }

    if (specificNeeds && specificNeeds.length > 0) {
      logic += `, 4) Addressing specific needs: ${specificNeeds.join(', ')}`;
    }

    logic += '.';
    return logic;
  }

  private generateProductSuggestions(
    skinType: SkinType,
    concerns: string[],
    selectedProducts: any[],
  ): string[] {
    const suggestions: string[] = [];

    // Add concern-specific tips
    for (const concern of concerns) {
      switch (concern.toLowerCase()) {
        case 'acne':
          suggestions.push(
            'Use exfoliants 2-3 times weekly to prevent clogged pores',
          );
          suggestions.push(
            'Avoid heavy oils and opt for gel or serum textures',
          );
          break;
        case 'dryness':
          suggestions.push(
            'Apply moisturizer to damp skin for better absorption',
          );
          suggestions.push(
            'Consider adding a hydrating toner or essence to your routine',
          );
          break;
        case 'sensitivity':
          suggestions.push(
            'Introduce new products one at a time to monitor reactions',
          );
          suggestions.push(
            'Avoid active ingredients if your skin is compromised',
          );
          break;
        case 'anti-aging':
          suggestions.push(
            'Start with lower concentrations of retinol and increase gradually',
          );
          suggestions.push(
            'Use sunscreen daily to prevent further aging damage',
          );
          break;
      }
    }

    // Add general suggestions
    suggestions.push(
      `All selected products are suitable for ${skinType} skin type`,
    );
    suggestions.push(
      `Products have been chosen for their proven efficacy (${selectedProducts.map((p) => p.rating).join(', ')} stars)`,
    );

    return suggestions;
  }
}
