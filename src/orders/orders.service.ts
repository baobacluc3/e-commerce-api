import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CartItem } from '../cart/cart.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class OrderService {
  constructor(private dataSource: DataSource) {}

  async createOrder(userId: number) {
    // 🔥 START TRANSACTION
    return this.dataSource.transaction(async (manager) => {
      // 1. Lấy cart
      const cartItems = await manager.find(CartItem, {
        where: { userId },
        relations: ['product'],
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      let total = 0;

      // 2. CHECK STOCK + LOCK
      for (const item of cartItems) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' }, // 🔥 khóa dòng DB
        });

        if (!product) {
          throw new NotFoundException('Product not found');
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Not enough stock for product ${product.id}`,
          );
        }

        total += item.quantity * product.price;
      }

      // 3. Tạo order
      const order = manager.create(Order, {
        userId,
        totalAmount: total,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await manager.save(order);

      // 4. Tạo order items + trừ stock
      const orderItems: OrderItem[] = [];

      for (const item of cartItems) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });

        // 🔥 trừ tồn kho
        product.stock -= item.quantity;
        await manager.save(product);

        const orderItem = manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });

        orderItems.push(orderItem);
      }

      await manager.save(orderItems);

      // 5. clear cart
      await manager.delete(CartItem, { userId });

      return savedOrder;
    });
  }

  async getOrders(userId: number) {
    return this.dataSource.getRepository(Order).find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderDetail(userId: number, orderId: number) {
    const order = await this.dataSource.getRepository(Order).findOne({
      where: { id: orderId, userId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}

/*
5. Giải thích Transaction (CỰC QUAN TRỌNG)
❓ Nếu KHÔNG có transaction

Case:

User A mua 5 sản phẩm
User B mua 5 sản phẩm
Stock = 5

👉 Cả 2 đều pass check → oversell ❌

✅ Khi có:
lock: { mode: 'pessimistic_write' }

👉 DB sẽ:

lock row product
chỉ cho 1 transaction chạy
thằng sau phải chờ


Flow thực tế:
Transaction A:
→ lock product
→ check stock
→ trừ stock
→ commit

Transaction B:
→ chờ A xong
→ check lại stock
→ fail nếu không đủ
*/
