import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './stategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  //entities
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
  PassportModule.register({
    defaultStrategy: 'jwt'
  }),
//async -- y usamos el configservice inyectado en lugar el process.env, ambas formas son vàlidas, pero con el config se pueden hacer otras configs en el service
  JwtModule.registerAsync({
    imports:[ConfigModule],
    inject: [ConfigService],
    useFactory:(configService: ConfigService) => {
        return {
            secret: configService.get('JWT_SECRET'),
             signOptions:{
             expiresIn: '2h'
    }
        }
    }
  })
  // sincrono
  // JwtModule.register({
  //   secret: process.env.JWT_SECRET,
  //   signOptions:{
  //     expiresIn: '2h'
  //   }
  // })
],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule]
})
export class AuthModule {}
