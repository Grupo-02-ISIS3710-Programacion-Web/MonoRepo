import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category, SkinType, ProductType } from '../../common/enums/product.enum';

@Entity('products')
export class ProductEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('varchar')
  name: string;

  @Column('varchar')
  brand: string;

  @Column('simple-array')
  skin_type: SkinType[];

  @Column('varchar')
  product_type: ProductType;

  @Column('simple-array')
  category: Category[];

  @Column('simple-array')
  ingredients: string[];

  @Column('simple-array')
  image_url: string[];

  @Column('text')
  description: string;

  @Column('float')
  rating: number;

  @Column('integer')
  review_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
