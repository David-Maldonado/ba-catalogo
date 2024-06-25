import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate  } from 'typeorm';
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
        default: ['user']
    })
    roles: string[]

    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.email = this.email.toLocaleLowerCase().trim();
    }

    @BeforeInsert()
    checkFieldsBeforeUpdate(){
        this.checkFieldsBeforeInsert()
    }

    
}
