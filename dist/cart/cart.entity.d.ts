import { Product } from '../products/product.entity';
export declare class CartItem {
    id: number;
    userId: number;
    productId: number;
    quantity: number;
    product: Product;
}
