import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enums/role.enum';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login no sistema',
    description: 'Autenticação de usuário com email e senha para obter token de acesso'
  })
  @ApiOkResponse({
    description: 'Login realizado com sucesso',
    type: LoginResponseDto,
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          name: 'John Doe',
          role: 'user',
          createdAt: '2024-03-06T12:00:00.000Z',
          updatedAt: '2024-03-06T12:00:00.000Z'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized'
      }
    }
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description: 'Cria uma nova conta de usuário com email, senha e nome'
  })
  @ApiCreatedResponse({
    description: 'Usuário registrado com sucesso',
    type: UserResponseDto,
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        name: 'John Doe',
        role: 'user',
        createdAt: '2024-03-06T12:00:00.000Z',
        updatedAt: '2024-03-06T12:00:00.000Z'
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou erro de validação',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'email must be a valid email',
          'password must be at least 6 characters long'
        ],
        error: 'Bad Request'
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Email já registrado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Email already registered',
        error: 'Unauthorized'
      }
    }
  })
  async register(@Body() registerDto: RegisterDto): Promise<UserResponseDto> {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );
  }

  @Post('register-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar novo administrador',
    description: 'Cria uma nova conta de administrador (requer permissão de ADMIN)'
  })
  @ApiCreatedResponse({
    description: 'Administrador registrado com sucesso',
    type: UserResponseDto,
    schema: {
      example: {
        id: 2,
        email: 'admin@store.com',
        name: 'Store Manager',
        role: 'admin',
        createdAt: '2024-03-06T12:00:00.000Z',
        updatedAt: '2024-03-06T12:00:00.000Z'
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou erro de validação',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'email must be a valid email',
          'password must be at least 6 characters long'
        ],
        error: 'Bad Request'
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Email já registrado ou acesso não autorizado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Email already registered',
        error: 'Unauthorized'
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Proibido - Requer permissão de ADMIN',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden'
      }
    }
  })
  async registerAdmin(@Body() registerAdminDto: RegisterAdminDto): Promise<UserResponseDto> {
    return this.authService.registerAdmin(
      registerAdminDto.email,
      registerAdminDto.password,
      registerAdminDto.name,
    );
  }
} 