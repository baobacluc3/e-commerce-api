import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import type { Request } from 'express';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@Req() req: Request, @Body() dto: AddToCartDto) {
    const userId = req.user?.['id'];
    return this.cartService.addToCart(userId, dto);
  }

  @Get()
  getCart(@Req() req: Request) {
    const userId = req.user?.['id'];
    return this.cartService.getCart(userId);
  }

  @Patch(':productId')
  updateItem(
    @Req() req: Request,
    @Param('productId') productId: number,
    @Body() dto: UpdateCartDto,
  ) {
    const userId = req.user?.['id'];
    return this.cartService.updateItem(userId, +productId, dto);
  }

  @Delete(':productId')
  removeItem(@Req() req: Request, @Param('productId') productId: number) {
    const userId = req.user?.['id'];
    return this.cartService.removeItem(userId, +productId);
  }

  @Delete()
  clearCart(@Req() req: Request) {
    const userId = req.user?.['id'];
    return this.cartService.clearCart(userId);
  }
}
