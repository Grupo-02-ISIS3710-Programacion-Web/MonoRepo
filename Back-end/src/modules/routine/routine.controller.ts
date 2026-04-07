import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { RoutineService } from './routine.service';
import { RoutineDto, CreateRoutineDto } from '../../common/dtos/routine.dto';

@Controller('routines')
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  @Get()
  getAllRoutines(@Query('userId') userId?: string): RoutineDto[] {
    if (userId) {
      return this.routineService.getByUserId(userId);
    }
    return this.routineService.getAll();
  }

  @Get(':id')
  getRoutineById(@Param('id') id: string): RoutineDto | undefined {
    return this.routineService.getById(id);
  }

  @Post()
  createRoutine(
    @Query('userId') userId: string,
    @Body() createRoutineDto: CreateRoutineDto,
  ): RoutineDto {
    return this.routineService.create(userId, createRoutineDto);
  }

  @Put(':id')
  updateRoutine(
    @Param('id') id: string,
    @Body() updateRoutineDto: Partial<CreateRoutineDto>,
  ): RoutineDto | undefined {
    return this.routineService.update(id, updateRoutineDto);
  }

  @Delete(':id')
  deleteRoutine(@Param('id') id: string): { success: boolean } {
    const success = this.routineService.delete(id);
    return { success };
  }

  @Post(':id/upvote/:userId')
  upvoteRoutine(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): RoutineDto | undefined {
    return this.routineService.addUpvote(id, userId);
  }

  @Post(':id/downvote/:userId')
  downvoteRoutine(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): RoutineDto | undefined {
    return this.routineService.addDownvote(id, userId);
  }
}
