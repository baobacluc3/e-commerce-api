import { Module } from '@nestjs/common';
import { OrderService } from './orders.service';
import { OrderController } from './orders.controller';

@Module({
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
