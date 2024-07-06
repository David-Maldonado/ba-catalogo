import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { Product, ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  // uso patrton de repositorio
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    // Datasource es propio de typeorm, entre otras cosas tiene info de la cadana de conex, usuario, etc
    private readonly dataSource: DataSource,
    // si se necesita otro repositorio se inyecta de la misma forma
  ) {}
  async create(createProductDto: CreateProductDto,user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      
      const newProduct = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
        user
      });
      await this.productRepository.save(newProduct);
      return { ...newProduct, images };
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    try {
      const product = await this.productRepository.find({
        take: limit,
        skip: offset,
        //relaciones.
        relations: {
          images: true,
        },
      });
      // "aplanar imagenes"
      return product.map((product) => ({
        ...product,
        images: product.images.map((img) => img.url),
      }));
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        //prodImages es un alias por si se necesite hacer otros joins. prod se le llama a la tabla (ver, porque no se llama asi en la db, es como un alias)
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product  with  ${term} not found`);
    return product;
  }

  //metodo para "aplanar get por term"

  async findOntPlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product) throw new NotFoundException(`Product  with  ${id} not found`);

    //evaluar si tiene imagenes.

    //Create query runner. (ver más info)
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    //trabajando con transacciones., si falla hacemos rollback o si no, hacemos el commit.
    await queryRunner.startTransaction();

    try {
      //si se actualizan y tiene imagenes, se eliminan las anteriores y se insertan las nuevas.
      if (images) {
        // ver documentacion sobre softdelete (es como para hacer un borrado lógico)
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }

      product.user = user;
     
      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();

      await queryRunner.release();

      //? código anterior sin usar transacciones: await this.productRepository.save(product);
      return this.findOntPlain(id);
    } catch (error) {
      // se puede usar aquí porque el transaction se crea fuera del try
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

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

  //para desarrollo o eliminar los seeds

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBException(error);
    }
  }
}
