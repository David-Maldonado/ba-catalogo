import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(
    //cuando se quiere usar un servicio en otro modulo (export el servicio e importar el modulo)
    //y se realiza la inject
    private readonly productService: ProductsService,
  ) {}

  async runSeed() {
    await this.insertNewProducts();

    return `SEED EXECUTE`;
  }

  private async insertNewProducts() {
    await this.productService.deleteAllProducts();
    const products = initialData.products;

    const insertPromises = [];

    products.forEach((product) => {
      //esperar a que todas las promesas se resuelvan 
      insertPromises.push(this.productService.create(product));
    });

    await Promise.all(insertPromises);
    return true;
  }
}
