import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  ManyToOne
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';
@Entity()
export class Product {
  @ApiProperty(
    {
      example: 'cc0f4b7e-0b1b-4b3b-8b3b-3b3b3b3b3b3b',
      description: 'The id of the product',
      uniqueItems: true,
    }
  )
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ApiProperty()
  @Column('text', { unique: true })
  title: string;
  @ApiProperty()

  @Column('float', { default: 0 })
  price: number;
  @ApiProperty()

  @Column('text', {
    nullable: true,
  })
  description: string;
  @ApiProperty()

  @Column('text', {
    unique: true,
  })
  slug: string;
  @ApiProperty()

  @Column('int', { default: 0 })
  stock: number;
  @ApiProperty()

  @Column('text', { array: true })
  sizes: string[];

  @Column('text')
  gender: string;

  // tags se insertaron dps., si esta en cincronizado, puede ir dar error hasta definir bien la columna
  @Column('text', { array: true, default: [] })
  tags: string[];
  //un producto puede tener varias imagenes entones OneToMany
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];



  @ManyToOne(
    () => User,
    (user) => user.products,
    { eager: true} // eager true para que traiga el usuario
  )
  user: User;
  @BeforeInsert()
  checSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug
      .toLocaleLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checSlugUpdate() {
    this.slug = this.title
      .toLocaleLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
