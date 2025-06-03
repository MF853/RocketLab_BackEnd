import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from './enums/role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdmin = {
    id: 2,
    email: 'admin@example.com',
    name: 'Admin User',
    role: Role.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLoginResponse = {
    access_token: 'mock_token',
    user: mockUser,
  };

  const mockAuthService = {
    login: jest.fn().mockResolvedValue(mockLoginResponse),
    register: jest.fn().mockResolvedValue(mockUser),
    registerAdmin: jest.fn().mockResolvedValue(mockAdmin),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login a user', async () => {
      const result = await controller.login(loginDto);
      expect(result).toEqual(mockLoginResponse);
      expect(service.login).toHaveBeenCalledWith(loginDto.email, loginDto.password);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const invalidLoginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValueOnce(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(invalidLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should successfully register a new user', async () => {
      const result = await controller.register(registerDto);
      expect(result).toEqual(mockUser);
      expect(service.register).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.password,
        registerDto.name,
      );
    });

    it('should throw UnauthorizedException for existing email', async () => {
      const existingEmailDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockAuthService.register.mockRejectedValueOnce(
        new UnauthorizedException('Email already registered'),
      );

      await expect(controller.register(existingEmailDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should set first registered user as ADMIN', async () => {
      mockAuthService.register.mockResolvedValueOnce({
        ...mockUser,
        role: Role.ADMIN,
      });

      const result = await controller.register(registerDto);
      expect(result.role).toBe(Role.ADMIN);
    });
  });

  describe('registerAdmin', () => {
    const registerAdminDto: RegisterAdminDto = {
      email: 'admin@example.com',
      password: 'password123',
      name: 'Admin User',
    };

    it('should successfully register a new admin', async () => {
      const result = await controller.registerAdmin(registerAdminDto);
      expect(result).toEqual(mockAdmin);
      expect(service.registerAdmin).toHaveBeenCalledWith(
        registerAdminDto.email,
        registerAdminDto.password,
        registerAdminDto.name,
      );
    });

    it('should throw UnauthorizedException for existing email', async () => {
      mockAuthService.registerAdmin.mockRejectedValueOnce(
        new UnauthorizedException('Email already registered'),
      );

      await expect(controller.registerAdmin(registerAdminDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
}); 