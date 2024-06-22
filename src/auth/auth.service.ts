import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';



@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRespository: Repository<User>
  ){
   

  }
  async create(createUserDto: CreateUserDto) {
    
    try {
      const { password, ...userData } = createUserDto;
      //no olvidar que es para "prepararlo"
     const user = this.userRespository.create({
      ...userData,
      password: bcrypt.hashSync(password, 10)

     });
     await this.userRespository.save(user);
     //para no mostrar en la respuesta.
     delete user.password;

     return user;


    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private handleDBErrors(error:any):never{
    if(error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);

    throw new InternalServerErrorException('Please check server logs')

  }

 
}
