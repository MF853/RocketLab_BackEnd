import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Produtos')
@Controller('products')
@ApiBearerAuth('JWT-auth')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Criar um novo produto',
    description: 'Cria um novo produto no catálogo (requer permissão de ADMIN)'
  })
  @ApiResponse({
    status: 201,
    description: 'Produto criado com sucesso',
    schema: {
      example: {
        id: 1,
        name: 'Smartphone XYZ',
        description: 'Um ótimo smartphone com câmera de alta resolução',
        category: 'electronics',
        price: 999.99,
        stock: 50,
        image: 'https://example.com/smartphone-xyz.jpg',
        createdAt: '2024-03-06T12:00:00.000Z',
        updatedAt: '2024-03-06T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos',
    schema: {
      example: {
        statusCode: 400,
        message: ['price must be a positive number', 'image must be a valid URL'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token inválido ou expirado'
  })
  @ApiResponse({
    status: 403,
    description: 'Proibido - Requer permissão de ADMIN'
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todos os produtos',
    description: 'Retorna a lista completa de produtos disponíveis'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos retornada com sucesso',
    schema: {
      example: [
        {
          id: 1,
          name: 'Smartphone XYZ',
          description: 'Um ótimo smartphone',
          category: 'electronics',
          price: 999.99,
          stock: 50,
          image: 'https://example.com/smartphone-xyz.jpg'
        },
        {
          id: 2,
          name: 'Laptop ABC',
          description: 'Laptop potente para trabalho',
          category: 'electronics',
          price: 1499.99,
          stock: 30,
          image: 'https://example.com/laptop-abc.jpg'
        }
      ]
    }
  })
  findAll() {
    return this.productService.findAll();
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Pesquisar produtos',
    description: 'Busca produtos por nome ou descrição'
  })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Termo de busca (nome ou descrição do produto)',
    example: 'smartphone'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos que correspondem ao termo de busca',
    schema: {
      example: [
        {
          id: 1,
          name: 'Smartphone XYZ',
          description: 'Um ótimo smartphone',
          price: 999.99,
          category: 'electronics',
          stock: 50
        }
      ]
    }
  })
  searchProducts(@Query('query') query: string) {
    return this.productService.searchProducts(query);
  }

  @Get('category/:category')
  @ApiOperation({ 
    summary: 'Listar produtos por categoria',
    description: 'Retorna todos os produtos de uma categoria específica'
  })
  @ApiParam({
    name: 'category',
    required: true,
    description: 'Nome da categoria',
    example: 'electronics'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos da categoria especificada',
    schema: {
      example: [
        {
          id: 1,
          name: 'Smartphone XYZ',
          category: 'electronics',
          price: 999.99,
          stock: 50
        },
        {
          id: 2,
          name: 'Laptop ABC',
          category: 'electronics',
          price: 1499.99,
          stock: 30
        }
      ]
    }
  })
  findByCategory(@Param('category') category: string) {
    return this.productService.findByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar produto por ID',
    description: 'Retorna os detalhes completos de um produto específico'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do produto',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Produto encontrado com sucesso',
    schema: {
      example: {
        id: 1,
        name: 'Smartphone XYZ',
        description: 'Um ótimo smartphone com câmera de alta resolução',
        category: 'electronics',
        price: 999.99,
        stock: 50,
        image: 'https://example.com/smartphone-xyz.jpg',
        createdAt: '2024-03-06T12:00:00.000Z',
        updatedAt: '2024-03-06T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Product with ID 1 not found',
        error: 'Not Found'
      }
    }
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Atualizar produto',
    description: 'Atualiza os dados de um produto existente (requer permissão de ADMIN)'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do produto',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Produto atualizado com sucesso',
    schema: {
      example: {
        id: 1,
        name: 'Smartphone XYZ Pro',
        price: 1099.99,
        stock: 45,
        updatedAt: '2024-03-06T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos'
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token inválido ou expirado'
  })
  @ApiResponse({
    status: 403,
    description: 'Proibido - Requer permissão de ADMIN'
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado'
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Remover produto',
    description: 'Remove um produto do catálogo (requer permissão de ADMIN)'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do produto',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Produto removido com sucesso'
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token inválido ou expirado'
  })
  @ApiResponse({
    status: 403,
    description: 'Proibido - Requer permissão de ADMIN'
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado'
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
