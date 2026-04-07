import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ProductEntity } from './entities/product.entity';
import { UserEntity } from './entities/user.entity';
import { RoutineEntity } from './entities/routine.entity';
import { RoutineStepEntity } from './entities/routine-step.entity';
import { CommentEntity } from './entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const skipDb = configService.get('SKIP_DB_INIT') === 'true';

        if (skipDb) {
          return {
            type: 'better-sqlite3',
            database: ':memory:',
            entities: [
              ProductEntity,
              UserEntity,
              RoutineEntity,
              RoutineStepEntity,
              CommentEntity,
            ],
            synchronize: true,
            logging: false,
          } as any;
        }

        return {
          type: 'postgres',
          host: configService.get('DB_HOST') || 'localhost',
          port: parseInt(configService.get('DB_PORT') || '5432'),
          username: configService.get('DB_USERNAME') || 'postgres',
          password: configService.get('DB_PASSWORD') || 'postgres',
          database: configService.get('DB_NAME') || 'skin4all',
          entities: [
            ProductEntity,
            UserEntity,
            RoutineEntity,
            RoutineStepEntity,
            CommentEntity,
          ],
          synchronize: configService.get('NODE_ENV') !== 'production',
          logging: false,
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
    }),
    TypeOrmModule.forFeature([
      ProductEntity,
      UserEntity,
      RoutineEntity,
      RoutineStepEntity,
      CommentEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
