import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  // uso patrton de repositorio
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    // si se necesita otro repositorio se inyecta de la misma forma
  ) {}
  async create(createProductDto: CreateProductDto) {
    try {
      const newProduct = this.productRepository.create(createProductDto);
      await this.productRepository.save(newProduct);
      return newProduct;
    } catch (error) {
      this.handleDBException(error);
    }
  }
  // todo: implementar paginacion
  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    try {
      return this.productRepository.find({
        take: limit,
        skip: offset,
      });
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product');
      queryBuilder.where('title ILIKE :term or slug ILIKE :term', {
        term: `%${term}%`,
      });
      product = await queryBuilder.getOne();
    }

    if (!product)
      throw new NotFoundException(`Product  with  ${term} not found`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });

    if (!product) throw new NotFoundException(`Product  with  ${id} not found`);

    try {
      return await this.productRepository.save(product);
    } catch (error) {
      this.handleDBException(error);
    }
  }
  async remove(id: string) {
    const product = await this.findOne(id);

    try {
      await this.productRepository.delete(id);
      return product;
    } catch (error) {
      this.handleDBException(error);
    }
  }

  private handleDBException(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check logs');
  }
}
