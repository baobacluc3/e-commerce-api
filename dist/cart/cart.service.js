"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_entity_1 = require("./cart.entity");
const product_entity_1 = require("../products/product.entity");
let CartService = class CartService {
    cartRepo;
    productRepo;
    constructor(cartRepo, productRepo) {
        this.cartRepo = cartRepo;
        this.productRepo = productRepo;
    }
    async addToCart(userId, dto) {
        const product = await this.productRepo.findOneBy({
            id: dto.productId,
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
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
    async getCart(userId) {
        const items = await this.cartRepo.find({
            where: { userId },
        });
        const total = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
        return {
            items,
            total,
        };
    }
    async updateItem(userId, productId, dto) {
        const item = await this.cartRepo.findOne({
            where: { userId, productId },
        });
        if (!item) {
            throw new common_1.NotFoundException('Item not found');
        }
        item.quantity = dto.quantity;
        return this.cartRepo.save(item);
    }
    async removeItem(userId, productId) {
        const item = await this.cartRepo.findOne({
            where: { userId, productId },
        });
        if (!item) {
            throw new common_1.NotFoundException('Item not found');
        }
        await this.cartRepo.remove(item);
        return { message: 'Item removed' };
    }
    async clearCart(userId) {
        await this.cartRepo.delete({ userId });
        return { message: 'Cart cleared' };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_entity_1.CartItem)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CartService);
//# sourceMappingURL=cart.service.js.map