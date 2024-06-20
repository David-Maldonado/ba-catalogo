import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNamer, fileFilter } from './helpers/index';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
    ) {}



  @Get('product/:imageName')
  findProductImage(
    //Esto es de node, express. No propiamente de nest. Asi que a tener cuaido al usarlo (Es que obligamos el comportamiento aqui)
    @Res() res: Response,
    @Param('imageName') imageName:string
  ){

    const path = this.filesService.getStaticProductImage(imageName);

    //manera de servir el archivo con express usando el path
    res.sendFile(path);
  }

  @Post('product')
  //?'file' en el interceptor es el nombre que tendra el parametro desde donde se envia el arhivo
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    //se pueden usar varias opciones, ejemplo: limits:{fileSize: 1000}
    storage: diskStorage(
    {
      destination: './static/uploads',
      filename: fileNamer
    }
    )
  }))
  uploadFile( 
    @UploadedFile() file: Express.Multer.File
    ){
   
  if(!file)
  {
    throw new BadRequestException('Make sure that the file is an image');
  }

  

    const sercureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;
    return {sercureUrl};
  }
}
