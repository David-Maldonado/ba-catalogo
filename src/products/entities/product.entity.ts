import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('text', { unique: true })
  title: string;
  @Column('float', { default: 0 })
  price: number;
  @Column('text', {
    nullable: true,
  })
  description: string;

  @Column('text', {
    unique: true,
  })
  slug: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column('text', { array: true })
  sizes: string[];

  @Column('text')
  gender: string;

  // tags se insertaron dps., si esta en cincronizado, puede ir dar error hasta definir bien la columna
  @Column('text', { array: true, default: [] })
  tags: string[];

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
