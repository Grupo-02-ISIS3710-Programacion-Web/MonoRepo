import { Injectable } from '@nestjs/common';
import { RoutineDto, CreateRoutineDto } from '../../common/dtos/routine.dto';
import { MOCK_ROUTINES } from './routine.data';

@Injectable()
export class RoutineService {
  private routines: RoutineDto[] = MOCK_ROUTINES;
  private nextId = 11;

  getAll(): RoutineDto[] {
    return this.routines;
  }

  getById(id: string): RoutineDto | undefined {
    return this.routines.find((routine) => routine.id === id);
  }

  getByUserId(userId: string): RoutineDto[] {
    return this.routines.filter((routine) => routine.userId === userId);
  }

  create(userId: string, createRoutineDto: CreateRoutineDto): RoutineDto {
    const newRoutine: RoutineDto = {
      id: `r${this.nextId++}`,
      userId,
      ...createRoutineDto,
      publishedAt: new Date().toISOString(),
      upvotes: [],
      downvotes: [],
      views: 0,
    };

    this.routines.push(newRoutine);
    return newRoutine;
  }

  update(
    id: string,
    updateRoutineDto: Partial<CreateRoutineDto>,
  ): RoutineDto | undefined {
    const routine = this.getById(id);
    if (!routine) {
      return undefined;
    }

    Object.assign(routine, updateRoutineDto);
    return routine;
  }

  delete(id: string): boolean {
    const index = this.routines.findIndex((routine) => routine.id === id);
    if (index === -1) {
      return false;
    }

    this.routines.splice(index, 1);
    return true;
  }

  addUpvote(id: string, userId: string): RoutineDto | undefined {
    const routine = this.getById(id);
    if (!routine) {
      return undefined;
    }

    if (!routine.upvotes) {
      routine.upvotes = [];
    }

    if (!routine.upvotes.includes(userId)) {
      routine.upvotes.push(userId);
      if (routine.downvotes && routine.downvotes.includes(userId)) {
        routine.downvotes = routine.downvotes.filter((id) => id !== userId);
      }
    }

    return routine;
  }

  addDownvote(id: string, userId: string): RoutineDto | undefined {
    const routine = this.getById(id);
    if (!routine) {
      return undefined;
    }

    if (!routine.downvotes) {
      routine.downvotes = [];
    }

    if (!routine.downvotes.includes(userId)) {
      routine.downvotes.push(userId);
      if (routine.upvotes && routine.upvotes.includes(userId)) {
        routine.upvotes = routine.upvotes.filter((id) => id !== userId);
      }
    }

    return routine;
  }
}
