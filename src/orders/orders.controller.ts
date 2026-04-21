import { Controller, Post, Get, Param, UseGuards, Req } from '@nestjs/common';
import { OrderService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  create(@Req() req: Request) {
    const userId = req.user['id'];
    return this.orderService.createOrder(userId);
  }

  @Get()
  getOrders(@Req() req: Request) {
    const userId = req.user['id'];
    return this.orderService.getOrders(userId);
  }

  @Get(':id')
  getDetail(@Req() req: Request, @Param('id') id: number) {
    const userId = req.user['id'];
    return this.orderService.getOrderDetail(userId, +id);
  }
}
