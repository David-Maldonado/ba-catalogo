import { Controller, Get, Post, Body,  UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { Auth, GetUser, RawHeaders, RoleProtected } from './decorators';
import { User } from './entities/user.entity';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ){
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  //el guard usa nuestra config de strategy?
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    //usando un custom decorator
    @RawHeaders() rawHeaders: string[],
    //usando un decorador propio de nestjs
    @Headers() header: IncomingHttpHeaders
  ){

    return {
      ok: true,
      message: 'Hola mundo Private Route',
      user,
      userEmail, 
      rawHeaders,
      header
    }
  }
  // @SetMetadata('roles', ['user', 'super-user'])
  @Get('private2')
  
  @RoleProtected( ValidRoles.user, ValidRoles.superUser, ValidRoles.admin)
  
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(
    @GetUser() user: User
  ){
    return {
      ok: true,
      user
    }
  }
  @Get('private3')
  @Auth() // decorador que usa RoleProtected y AuthGuard para evitar repetir codigo
  privateRoute3(
    @GetUser() user: User
  ){
    return {
      ok: true,
      user
    }
  }



}
