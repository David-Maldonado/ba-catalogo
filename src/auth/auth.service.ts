import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';



@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRespository: Repository<User>,
    private readonly jwtService: JwtService
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
     //para no mostrar en la respuesta. (es una forma, otra es poner select en false en el entity)
     delete user.password;

     return {
      ...user,
      token: this.getJwtToken({id: user.id})
    };


    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto:LoginUserDto){
      const { password, email} = loginUserDto;

      //se obtienen los valores y se crea un objeto user con esos valores
      const user = await this.userRespository.findOne({
        where: {email},
        select: { email: true, password:true, id: true}
      });

    
      if(!user){
        throw new UnauthorizedException('Credentials are not valid (email)')
      }

      if(!bcrypt.compareSync(password, user.password)){
        throw new UnauthorizedException('Credentials are not valid (password)')
      }
      
      return {
        ...user,
        token: this.getJwtToken({id: user.id})
      };


  }

  async checkAuthStatus(user: User){
    return {
      ...user,
      token: this.getJwtToken({id: user.id})
    };
  }

  private getJwtToken(payload: JwtPayload){

    const token = this.jwtService.sign(payload);

    return token;
  }

  private handleDBErrors(error:any):never{
    if(error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);

    throw new InternalServerErrorException('Please check server logs')

  }

 
}
