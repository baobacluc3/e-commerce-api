import { Module } from '@nestjs/common';
import { OrderService } from './orders.service';
import { OrderController } from './orders.controller';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}

/*
8. Interview bạn nói gì?

👉 “Tôi xử lý concurrency bằng cách dùng transaction + pessimistic lock để tránh oversell”

👉 “Order creation là atomic operation”

👉 “Tôi lưu snapshot price trong order_items”

🔥 Đây là câu trả lời mid-level dev
*/
