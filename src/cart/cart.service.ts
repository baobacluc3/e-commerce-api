import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Product } from '../products/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepo: Repository<CartItem>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async addToCart(userId: number, dto: AddToCartDto) {
    const product = await this.productRepo.findOneBy({
      id: dto.productId,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.cartRepo.findOne({
      where: { userId, productId: dto.productId },
    });

    if (existing) {
      existing.quantity += dto.quantity;
      return this.cartRepo.save(existing);
    }

    const item = this.cartRepo.create({
      userId,
      productId: dto.productId,
      quantity: dto.quantity,
    });

    return this.cartRepo.save(item);
  }

  async getCart(userId: number) {
    const items = await this.cartRepo.find({
      where: { userId },
    });

    const total = items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0,
    );

    return {
      items,
      total,
    };
  }

  async updateItem(userId: number, productId: number, dto: UpdateCartDto) {
    const item = await this.cartRepo.findOne({
      where: { userId, productId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    item.quantity = dto.quantity;
    return this.cartRepo.save(item);
  }

  async removeItem(userId: number, productId: number) {
    const item = await this.cartRepo.findOne({
      where: { userId, productId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    await this.cartRepo.remove(item);

    return { message: 'Item removed' };
  }

  async clearCart(userId: number) {
    await this.cartRepo.delete({ userId });
    return { message: 'Cart cleared' };
  }
}
