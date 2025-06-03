import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { BadRequestException } from '@nestjs/common';
import { RequestWithUser } from '../auth/types/request-with-user';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'USER',
  };

  const mockRequest = {
    user: mockUser,
    get: jest.fn(),
    header: jest.fn(),
    accepts: jest.fn(),
    acceptsCharsets: jest.fn(),
    acceptsEncodings: jest.fn(),
    acceptsLanguages: jest.fn(),
    param: jest.fn(),
    query: {},
    body: {},
    cookies: {},
    method: 'GET',
    protocol: 'http',
    secure: false,
    ip: '::1',
    ips: [],
    subdomains: [],
    path: '/',
    hostname: 'localhost',
    host: 'localhost',
    fresh: false,
    stale: true,
    xhr: false,
    route: {},
    signedCookies: {},
    originalUrl: '/',
    url: '/',
    baseUrl: '',
    app: {},
    res: {},
    next: jest.fn(),
  } as unknown as RequestWithUser;

  const mockCartItem = {
    id: 1,
    productId: 1,
    quantity: 2,
    price: 99.99,
  };

  const mockCart = {
    id: 1,
    userId: 1,
    items: [mockCartItem],
    total: 199.98,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCartService = {
    createCart: jest.fn().mockResolvedValue(mockCart),
    getUserCart: jest.fn().mockResolvedValue(mockCart),
    addItem: jest.fn().mockResolvedValue(mockCart),
    removeItem: jest.fn().mockResolvedValue(mockCart),
    deleteCart: jest.fn().mockResolvedValue(mockCart),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCart', () => {
    it('should create a new cart for the user', async () => {
      const result = await controller.createCart(mockRequest);
      expect(result).toEqual(mockCart);
      expect(service.createCart).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getMyCart', () => {
    it("should return the user's cart", async () => {
      const result = await controller.getMyCart(mockRequest);
      expect(result).toEqual(mockCart);
      expect(service.getUserCart).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('addItem', () => {
    const addItemDto: AddItemDto = {
      productId: 1,
      quantity: 2,
    };

    it("should add an item to the user's cart", async () => {
      const result = await controller.addItem(1, addItemDto, mockRequest);
      expect(result).toEqual(mockCart);
      expect(service.addItem).toHaveBeenCalledWith(1, addItemDto);
    });

    it("should throw BadRequestException when trying to modify another user's cart", async () => {
      mockCartService.getUserCart.mockResolvedValueOnce({
        ...mockCart,
        id: 2, // Different cart ID
      });

      await expect(controller.addItem(1, addItemDto, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('removeItem', () => {
    it("should remove an item from the user's cart", async () => {
      const result = await controller.removeItem(1, 1, mockRequest);
      expect(result).toEqual(mockCart);
      expect(service.removeItem).toHaveBeenCalledWith(1, 1);
    });

    it("should throw BadRequestException when trying to modify another user's cart", async () => {
      mockCartService.getUserCart.mockResolvedValueOnce({
        ...mockCart,
        id: 2, // Different cart ID
      });

      await expect(controller.removeItem(1, 1, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteCart', () => {
    it("should delete the user's cart", async () => {
      const result = await controller.deleteCart(1, mockRequest);
      expect(result).toEqual(mockCart);
      expect(service.deleteCart).toHaveBeenCalledWith(1);
    });

    it("should throw BadRequestException when trying to delete another user's cart", async () => {
      mockCartService.getUserCart.mockResolvedValueOnce({
        ...mockCart,
        id: 2, // Different cart ID
      });

      await expect(controller.deleteCart(1, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
