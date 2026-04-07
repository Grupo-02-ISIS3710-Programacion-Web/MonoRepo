import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RoutineEntity } from './routine.entity';
import { CommentEntity } from './comment.entity';
import { SkinType } from '../../common/enums/product.enum';

@Entity('users')
export class UserEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('varchar')
  email: string;

  @Column('varchar')
  password: string;

  @Column('varchar')
  username: string;

  @Column('varchar')
  skin_type: SkinType;

  @Column('simple-array')
  concerns: string[];

  @Column('varchar', { nullable: true })
  profile_picture?: string;

  @OneToMany(() => RoutineEntity, (routine) => routine.user)
  routines: RoutineEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
