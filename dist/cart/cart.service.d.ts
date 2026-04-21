import { Repository } from 'typeorm';
import { CartItem } from './cart.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Product } from '../products/product.entity';
export declare class CartService {
    private cartRepo;
    private productRepo;
    constructor(cartRepo: Repository<CartItem>, productRepo: Repository<Product>);
    addToCart(userId: number, dto: AddToCartDto): Promise<CartItem>;
    getCart(userId: number): Promise<{
        items: CartItem[];
        total: number;
    }>;
    updateItem(userId: number, productId: number, dto: UpdateCartDto): Promise<CartItem>;
    removeItem(userId: number, productId: number): Promise<{
        message: string;
    }>;
    clearCart(userId: number): Promise<{
        message: string;
    }>;
}
