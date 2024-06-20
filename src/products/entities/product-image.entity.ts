import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';
@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  // varias imagenes puede tener un unico producto
  @ManyToOne(() => Product, (product) => product.images, {onDelete: 'CASCADE'})
  product: Product;
}
