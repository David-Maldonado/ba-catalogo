import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}



  @Get()
  //@Auth(ValidRoles.admin) //solo los admins pueden ejecutar el seed
  executeSeed() {
    return this.seedService.runSeed();
  }

}
