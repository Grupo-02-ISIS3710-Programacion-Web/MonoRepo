/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { StructuredTool } from '@langchain/core/tools';
import {
  ProductSearchTool,
  ProductSearchBySkinTypeTool,
  ProductSearchByIngredientTool,
  ProductGetByIdTool,
  GetAllProductsTool,
} from './product-search.tools';
import { ProductService } from '../product/product.service';

@Injectable()
export class LangChainToolService {
  private tools: StructuredTool[] = [];

  constructor(private productService: ProductService) {
    this.initializeTools();
  }

  private initializeTools(): void {
    this.tools = [
      new ProductSearchTool(this.productService),
      new ProductSearchBySkinTypeTool(this.productService),
      new ProductSearchByIngredientTool(this.productService),
      new ProductGetByIdTool(this.productService),
      new GetAllProductsTool(this.productService),
    ];
  }

  getTools(): StructuredTool[] {
    return this.tools;
  }

  getToolDefinitions(): Array<{
    name: string;
    description: string;
    input_schema: any;
  }> {
    return this.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.schema,
    }));
  }

  async executeTool(toolName: string, input: any): Promise<string> {
    const tool = this.tools.find((t) => t.name === toolName);
    if (!tool) {
      return JSON.stringify({
        error: `Tool ${toolName} not found`,
      });
    }

    try {
      const result = await tool.call(input);
      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({
        error: `Error executing tool ${toolName}: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  getTool(toolName: string): StructuredTool | undefined {
    return this.tools.find((t) => t.name === toolName);
  }

  async runAgentLoop(
    initialPrompt: string,
    maxIterations: number = 5,
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
    const toolCalls: Array<{
      iteration: number;
      toolName: string;
      input: any;
      output: string;
    }> = [];
    const reasoning: string[] = [];

    const toolsToUse = this.parsePromptForTools(initialPrompt);

    reasoning.push(`Initial prompt: ${initialPrompt}`);
    reasoning.push(`Identified tools to use: ${toolsToUse.join(', ')}`);

    let iteration = 0;
    let finalResponse = '';

    for (const toolName of toolsToUse) {
      iteration++;
      if (iteration > maxIterations) {
        reasoning.push(
          `Reached maximum iterations (${maxIterations}), stopping agent loop`,
        );
        break;
      }

      const tool = this.getTool(toolName);
      if (!tool) {
        reasoning.push(`Tool ${toolName} not found, skipping...`);
        continue;
      }

      const input = this.generateToolInput(initialPrompt, toolName);
      reasoning.push(`Iteration ${iteration}: Calling tool ${toolName}`);
      reasoning.push(`Input: ${JSON.stringify(input)}`);

      try {
        const output = await this.executeTool(toolName, input);
        toolCalls.push({
          iteration,
          toolName,
          input,
          output,
        });
        reasoning.push(`Output received: ${output.substring(0, 100)}...`);

        finalResponse = this.processToolOutput(toolName, output, finalResponse);
      } catch (error) {
        reasoning.push(
          `Error in iteration ${iteration}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return {
      finalResponse,
      toolCalls,
      reasoning,
    };
  }

  private parsePromptForTools(prompt: string): string[] {
    const lowerPrompt = prompt.toLowerCase();
    const tools: string[] = [];

    if (
      lowerPrompt.includes('category') ||
      lowerPrompt.includes('hydration') ||
      lowerPrompt.includes('cleansing') ||
      lowerPrompt.includes('exfoliat')
    ) {
      tools.push('search_products_by_category');
    }

    if (
      lowerPrompt.includes('skin type') ||
      lowerPrompt.includes('oily') ||
      lowerPrompt.includes('dry') ||
      lowerPrompt.includes('sensitive')
    ) {
      tools.push('search_products_by_skin_type');
    }

    if (
      lowerPrompt.includes('ingredient') ||
      lowerPrompt.includes('vitamin') ||
      lowerPrompt.includes('retinol') ||
      lowerPrompt.includes('hyaluronic') ||
      lowerPrompt.includes('niacinamide')
    ) {
      tools.push('search_products_by_ingredient');
    }

    if (
      lowerPrompt.includes('product id') ||
      lowerPrompt.includes('specific product')
    ) {
      tools.push('get_product_by_id');
    }

    if (
      lowerPrompt.includes('all products') ||
      lowerPrompt.includes('browse') ||
      lowerPrompt.includes('list')
    ) {
      tools.push('get_all_products');
    }

    if (tools.length === 0) {
      tools.push('get_all_products');
    }

    return tools;
  }

  private generateToolInput(prompt: string, toolName: string): any {
    switch (toolName) {
      case 'search_products_by_category':
        if (prompt.toLowerCase().includes('hydration'))
          return { category: 'hidratacion', limit: 5 };
        if (prompt.toLowerCase().includes('clean'))
          return { category: 'limpieza', limit: 5 };
        if (prompt.toLowerCase().includes('exfoliat'))
          return { category: 'exfoliacion', limit: 5 };
        if (prompt.toLowerCase().includes('anti-age'))
          return { category: 'anti-edad', limit: 5 };
        return { category: 'ALL', limit: 5 };

      case 'search_products_by_skin_type':
        if (prompt.toLowerCase().includes('oily'))
          return { skin_type: 'grasa', limit: 5 };
        if (prompt.toLowerCase().includes('dry'))
          return { skin_type: 'seca', limit: 5 };
        if (prompt.toLowerCase().includes('sensitive'))
          return { skin_type: 'sensible', limit: 5 };
        if (prompt.toLowerCase().includes('combination'))
          return { skin_type: 'mixta', limit: 5 };
        return { skin_type: 'normal', limit: 5 };

      case 'search_products_by_ingredient': {
        const ingredientMatch = prompt.match(
          /(?:ingredient|contains|with)\s+(\w+)/i,
        );
        return {
          ingredient: ingredientMatch ? ingredientMatch[1] : 'hyaluronic',
          limit: 5,
        };
      }

      case 'get_product_by_id': {
        const idMatch = prompt.match(/\d+/);
        return { product_id: idMatch ? idMatch[0] : '1' };
      }

      case 'get_all_products':
        return { limit: 10 };

      default:
        return {};
    }
  }

  private processToolOutput(
    toolName: string,
    output: string,
    previousResponse: string,
  ): string {
    try {
      const parsed = JSON.parse(output);
      const isArray = Array.isArray(parsed);

      if (isArray && parsed.length > 0) {
        const summary = `Found ${parsed.length} product(s):`;
        const productList = parsed
          .map(
            (p: any) =>
              `- ${p.name} by ${p.brand} (Rating: ${p.rating}/5, ID: ${p.id})`,
          )
          .join('\n');

        return previousResponse
          ? `${previousResponse}\n\n${summary}\n${productList}`
          : `${summary}\n${productList}`;
      } else if (isArray && parsed.length === 0) {
        return previousResponse || 'No products found matching the criteria.';
      } else if (parsed.error) {
        return previousResponse || `Error: ${parsed.error}`;
      } else {
        return (
          previousResponse ||
          `Product: ${parsed.name} by ${parsed.brand} (Rating: ${parsed.rating}/5)`
        );
      }
    } catch {
      return previousResponse || output;
    }
  }
}
