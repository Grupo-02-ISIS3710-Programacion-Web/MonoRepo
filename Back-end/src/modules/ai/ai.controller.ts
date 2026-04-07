import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import {
  AIService,
  type RoutineGenerationRequest,
  type AIRoutineResponse,
} from './ai.service';
import { LangChainToolService } from './langchain.service';
import { SkinType } from '../../common/enums/product.enum';

@Controller('ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly langChainToolService: LangChainToolService,
  ) {}

  @Post('routines/generate')
  generateRoutine(
    @Body() request: RoutineGenerationRequest,
  ): AIRoutineResponse {
    return this.aiService.generateRoutineForUser(request);
  }

  @Post('products/suggest')
  suggestProducts(
    @Body()
    body: {
      skinType: SkinType;
      concerns: string[];
      maxResults?: number;
    },
  ): {
    products: any[];
    suggestions: string[];
  } {
    return this.aiService.suggestProductsForConcerns(
      body.skinType,
      body.concerns,
      body.maxResults,
    );
  }

  @Get('routines/recommendations')
  getRoutineRecommendations(
    @Query('skinType') skinType: SkinType,
    @Query('routineType') routineType: 'morning' | 'night' = 'morning',
  ): {
    productSequence: string[];
    tips: string[];
    waitTimes: { [key: string]: string };
  } {
    return this.aiService.getRoutineRecommendations(skinType, routineType);
  }

  @Get('tools')
  getAvailableTools(): Array<{
    name: string;
    description: string;
    input_schema: any;
  }> {
    return this.langChainToolService.getToolDefinitions();
  }

  @Post('agent/chat')
  async runAgentChat(
    @Body()
    body: {
      prompt: string;
      maxIterations?: number;
    },
  ): Promise<{
    finalResponse: string;
    toolCalls: Array<{
      iteration: number;
      toolName: string;
      input: any;
      output: string;
    }>;
    reasoning: string[];
  }> {
    return this.langChainToolService.runAgentLoop(
      body.prompt,
      body.maxIterations || 5,
    );
  }

  @Post('agent/search')
  async searchWithAgent(
    @Body()
    body: {
      query: string;
      filters?: {
        skinType?: SkinType;
        category?: string;
        ingredient?: string;
      };
    },
  ): Promise<{
    results: any[];
    agentReasoning: string;
  }> {
    const results = await this.langChainToolService.runAgentLoop(body.query, 3);
    return {
      results: results.toolCalls,
      agentReasoning: results.reasoning.join(' -> '),
    };
  }
}
