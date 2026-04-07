import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { RoutineStepEntity } from './routine-step.entity';
import { CommentEntity } from './comment.entity';

@Entity('routines')
export class RoutineEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('varchar')
  user_id: string;

  @Column('varchar')
  name: string;

  @Column('text')
  description: string;

  @Column('varchar')
  routine_type: 'morning' | 'night' | 'weekly';

  @Column('integer')
  upvotes: number;

  @Column('integer')
  downvotes: number;

  @ManyToOne(() => UserEntity, (user) => user.routines)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => RoutineStepEntity, (step) => step.routine)
  steps: RoutineStepEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.routine)
  comments: CommentEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
