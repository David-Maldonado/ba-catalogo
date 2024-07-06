import { Product } from 'src/products/entities';
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany  } from 'typeorm';
@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {unique:true})
    email:string;
    //para que no devuelva o muestre el pass
    @Column('text', {
        select:false
    })
    password:string;

    @Column('text')
    fullName:string;

    @Column('bool', {
        default: true
    })
    isActive: boolean;

    @Column('text', {
        array:true,
        default: ['admin']
    })
    roles: string[]

    @OneToMany(
        () => Product,
        (product) => product.user,
        {cascade: true}
    )
    products: Product

    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.email = this.email.toLocaleLowerCase().trim();
    }

    @BeforeInsert()
    checkFieldsBeforeUpdate(){
        this.checkFieldsBeforeInsert()
    }

    
}
