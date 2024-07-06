import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'The title of the product',
    example: 'Nike Air Max 90',
    uniqueItems: false,
  })
  @IsString()
  @MinLength(1)
  title: string;
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  @IsOptional()
  slug?: string;
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;
  @IsString({ each: true })
  @IsArray()
  sizes: string[];
  @IsIn(['caballero', 'dama', 'niños', 'unisex'])
  gender: string;
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags: string[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];
}
