import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async createCart() {
    return this.prisma.cart.create({
      data: {},
    });
  }

  async addItem(cartId: number, addItemDto: AddItemDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: addItemDto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${addItemDto.productId} not found`);
    }

    if (product.stock < addItemDto.quantity) {
      throw new Error(`Insufficient stock for product ${product.name}`);
    }

    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    // Check if product already exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId: addItemDto.productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity if item exists
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + addItemDto.quantity },
      });
    } else {
      // Create new item if it doesn't exist
      await this.prisma.cartItem.create({
        data: {
          cartId,
          productId: addItemDto.productId,
          quantity: addItemDto.quantity,
        },
      });
    }

    // Update cart total
    const updatedCart = await this.calculateAndUpdateTotal(cartId);
    return updatedCart;
  }

  async removeItem(cartId: number, productId: number) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`Product with ID ${productId} not found in cart ${cartId}`);
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    // Update cart total
    const updatedCart = await this.calculateAndUpdateTotal(cartId);
    return updatedCart;
  }

  async getCart(cartId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    return cart;
  }

  private async calculateAndUpdateTotal(cartId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0,
    );

    return this.prisma.cart.update({
      where: { id: cartId },
      data: { total },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}
