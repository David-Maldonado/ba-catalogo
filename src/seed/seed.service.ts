import { Inject, Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    //cuando se quiere usar un servicio en otro modulo (export el servicio e importar el modulo)
    //y se realiza la inject
    private readonly productService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
      ) {}

  async runSeed() {

    await this.deleteTables();

    const user = await this.insertUsers();

    await this.insertNewProducts(user);

    return `SEED EXECUTE`;
  }

  private async deleteTables() {
    //borrar todos los productos e imagenes porque esta en cascada
    await this.productService.deleteAllProducts();

    //borrar todos los usuarios
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete()
    .where({})
    .execute();

    return true;
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];

    // preparamos los usuarios
    seedUsers.forEach((seedUser) => {
      users.push(this.userRepository.create(seedUser));
    });

    // insertamos los usuarios
    const dbUser = await this.userRepository.save(seedUsers);
    return dbUser[0];
  }

  private async insertNewProducts(user: User) {
    await this.productService.deleteAllProducts();
    const products = initialData.products;

    const insertPromises = [];

    products.forEach((product) => {
      //esperar a que todas las promesas se resuelvan 
      insertPromises.push(this.productService.create(product, user));
    });

    await Promise.all(insertPromises);
    return true;
  }
}
