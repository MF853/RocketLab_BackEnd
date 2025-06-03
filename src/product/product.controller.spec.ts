import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    category: 'electronics',
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProducts = [
    mockProduct,
    {
      id: 2,
      name: 'Another Product',
      description: 'Another Description',
      price: 149.99,
      category: 'electronics',
      stock: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockProductService = {
    create: jest.fn().mockResolvedValue(mockProduct),
    findAll: jest.fn().mockResolvedValue(mockProducts),
    findOne: jest.fn().mockResolvedValue(mockProduct),
    update: jest.fn().mockResolvedValue(mockProduct),
    remove: jest.fn().mockResolvedValue(mockProduct),
    searchProducts: jest.fn().mockResolvedValue([mockProduct]),
    findByCategory: jest.fn().mockResolvedValue([mockProduct]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createProductDto: CreateProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'electronics',
      stock: 10,
      image: 'test-image.jpg'
    };

    it('should create a new product', async () => {
      const result = await controller.create(createProductDto);
      expect(result).toEqual(mockProduct);
      expect(service.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const result = await controller.findAll();
      expect(result).toEqual(mockProducts);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const result = await controller.findOne(1);
      expect(result).toEqual(mockProduct);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    const updateProductDto: UpdateProductDto = {
      name: 'Updated Product',
      price: 129.99,
    };

    it('should update a product', async () => {
      const result = await controller.update(1, updateProductDto);
      expect(result).toEqual(mockProduct);
      expect(service.update).toHaveBeenCalledWith(1, updateProductDto);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const result = await controller.remove(1);
      expect(result).toEqual(mockProduct);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('searchProducts', () => {
    it('should return products matching the search term', async () => {
      const searchTerm = 'test';
      const result = await controller.searchProducts(searchTerm);
      expect(result).toEqual([mockProduct]);
      expect(service.searchProducts).toHaveBeenCalledWith(searchTerm);
    });
  });

  describe('findByCategory', () => {
    it('should return products in the specified category', async () => {
      const category = 'electronics';
      const result = await controller.findByCategory(category);
      expect(result).toEqual([mockProduct]);
      expect(service.findByCategory).toHaveBeenCalledWith(category);
    });
  });
});
