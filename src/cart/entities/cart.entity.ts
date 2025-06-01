import { Product } from '.prisma/client';

export class CartItem {
  productId: number;
  quantity: number;
  product: Product;
}

export class Cart {
  id: number;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
  total: number;
}
