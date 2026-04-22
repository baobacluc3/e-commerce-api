import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id); // throws 404 nếu không có
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
    return { message: `Product #${id} deleted` };
  }

  // Dùng nội bộ (orders service gọi để check stock)
  async adjustStock(id: number, delta: number): Promise<void> {
    const product = await this.findOne(id);
    if (product.stock + delta < 0) {
      throw new BadRequestException(`Not enough stock for product #${id}`);
    }
    product.stock += delta;
    await this.productRepo.save(product);
  }
}
