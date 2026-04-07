import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { LangChainToolService } from './langchain.service';
import { ProductModule } from '../product/product.module';
import { RoutineModule } from '../routine/routine.module';

@Module({
  imports: [ProductModule, RoutineModule],
  controllers: [AIController],
  providers: [AIService, LangChainToolService],
  exports: [AIService, LangChainToolService],
})
export class AIModule {}
