import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { RoutineEntity } from './routine.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('varchar')
  user_id: string;

  @Column('varchar')
  routine_id: string;

  @Column('text')
  content: string;

  @Column('integer')
  rating: number;

  @ManyToOne(() => UserEntity, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => RoutineEntity, (routine) => routine.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'routine_id' })
  routine: RoutineEntity;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
