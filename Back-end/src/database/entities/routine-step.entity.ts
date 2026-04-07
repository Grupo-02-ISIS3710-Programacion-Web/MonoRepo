import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RoutineEntity } from './routine.entity';

@Entity('routine_steps')
export class RoutineStepEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('varchar')
  routine_id: string;

  @Column('varchar')
  product_id: string;

  @Column('integer')
  step_number: number;

  @Column('text')
  notes: string;

  @ManyToOne(() => RoutineEntity, (routine) => routine.steps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'routine_id' })
  routine: RoutineEntity;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
