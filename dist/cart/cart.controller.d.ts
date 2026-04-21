import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import type { Request } from 'express';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    addToCart(req: Request, dto: AddToCartDto): Promise<import("./cart.entity").CartItem>;
    getCart(req: Request): Promise<{
        items: import("./cart.entity").CartItem[];
        total: number;
    }>;
    updateItem(req: Request, productId: number, dto: UpdateCartDto): Promise<import("./cart.entity").CartItem>;
    removeItem(req: Request, productId: number): Promise<{
        message: string;
    }>;
    clearCart(req: Request): Promise<{
        message: string;
    }>;
}
