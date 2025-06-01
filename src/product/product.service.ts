import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';
import type { Product } from '.prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const product = await this.prisma.product.create({
        data: createProductDto,
      });
      return product;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create product: ${error.message}`);
      }
      throw new Error('Failed to create product');
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      const products = await this.prisma.product.findMany();
      return products;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
      }
      throw new Error('Failed to fetch products');
    }
  }

  async findOne(id: number): Promise<Product> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error(`Failed to fetch product: ${error.message}`);
      }
      throw new Error('Failed to fetch product');
    }
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
      });
      return product;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      if (error instanceof Error) {
        throw new Error(`Failed to update product: ${error.message}`);
      }
      throw new Error('Failed to update product');
    }
  }

  async remove(id: number): Promise<Product> {
    try {
      const product = await this.prisma.product.delete({
        where: { id },
      });
      return product;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      if (error instanceof Error) {
        throw new Error(`Failed to delete product: ${error.message}`);
      }
      throw new Error('Failed to delete product');
    }
  }

  async findByCategory(category: string): Promise<Product[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: { category },
      });
      return products;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch products by category: ${error.message}`);
      }
      throw new Error('Failed to fetch products by category');
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        },
      });
      return products;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search products: ${error.message}`);
      }
      throw new Error('Failed to search products');
    }
  }
}
