import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AddItemDto } from './dto/add-item.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Cart } from './entities/cart.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/types/request-with-user';

@ApiTags('Carrinho')
@Controller('cart')
@ApiBearerAuth('JWT-auth')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: 'Criar um novo carrinho',
    description: 'Cria um novo carrinho de compras vazio para o usuário autenticado. Cada usuário só pode ter um carrinho ativo por vez.',
  })
  @ApiResponse({
    status: 201,
    description: 'Carrinho criado com sucesso.',
    type: Cart,
    schema: {
      example: {
        id: 1,
        userId: 1,
        items: [],
        total: 0,
        createdAt: '2024-03-06T12:00:00.000Z',
        updatedAt: '2024-03-06T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token inválido ou expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'Proibido - Usuário sem permissão necessária',
  })
  @ApiBadRequestResponse({ 
    description: 'Usuário já possui um carrinho ativo',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'User already has a cart' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  createCart(@Request() req: RequestWithUser) {
    return this.cartService.createCart(req.user.id);
  }

  @Get('my-cart')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ 
    summary: 'Buscar o carrinho do usuário logado',
    description: 'Retorna o carrinho ativo do usuário autenticado com todos os seus itens, incluindo detalhes dos produtos e valor total.'
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna o carrinho do usuário com seus itens e total.',
    type: Cart,
    schema: {
      example: {
        id: 1,
        userId: 1,
        items: [
          {
            id: 1,
            productId: 1,
            quantity: 2,
            product: {
              id: 1,
              name: "Smartphone XYZ",
              description: "Um ótimo smartphone",
              price: 999.99,
              stock: 10,
              category: "electronics",
              image: "https://example.com/image.jpg"
            }
          }
        ],
        total: 1999.98,
        createdAt: "2024-03-06T12:00:00.000Z",
        updatedAt: "2024-03-06T12:00:00.000Z"
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token inválido ou expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'Proibido - Usuário sem permissão necessária',
  })
  @ApiResponse({
    status: 404,
    description: 'Carrinho não encontrado para o usuário',
  })
  getMyCart(@Request() req: RequestWithUser) {
    return this.cartService.getUserCart(req.user.id);
  }

  @Post(':id/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ 
    summary: 'Adicionar um item ao carrinho',
    description: 'Adiciona um produto ao carrinho especificado. Se o produto já existir no carrinho, a quantidade será somada. Verifica disponibilidade em estoque.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID do carrinho',
    type: 'number',
    required: true,
    example: 1
  })
  @ApiBody({
    type: AddItemDto,
    description: 'Dados do item a ser adicionado ao carrinho',
    schema: {
      example: {
        productId: 1,
        quantity: 2
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Item adicionado ao carrinho com sucesso.',
    type: Cart,
    schema: {
      example: {
        id: 1,
        userId: 1,
        items: [
          {
            id: 1,
            productId: 1,
            quantity: 2,
            product: {
              id: 1,
              name: "Smartphone XYZ",
              price: 999.99
            }
          }
        ],
        total: 1999.98
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao adicionar item - Possíveis causas: estoque insuficiente, carrinho não pertence ao usuário',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token inválido ou expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'Proibido - Usuário sem permissão necessária',
  })
  @ApiResponse({
    status: 404,
    description: 'Carrinho ou produto não encontrado',
  })
  async addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() addItemDto: AddItemDto,
    @Request() req: RequestWithUser,
  ) {
    const userCart = await this.cartService.getUserCart(req.user.id);
    if (userCart.id !== id) {
      throw new BadRequestException('Você só pode modificar seu próprio carrinho');
    }
    return this.cartService.addItem(id, addItemDto);
  }

  @Delete(':cartId/items/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ 
    summary: 'Remover um item do carrinho',
    description: 'Remove um produto específico do carrinho. Remove o item completamente, independente da quantidade.'
  })
  @ApiParam({
    name: 'cartId',
    description: 'ID do carrinho',
    type: 'number',
    required: true,
    example: 1
  })
  @ApiParam({
    name: 'productId',
    description: 'ID do produto a ser removido',
    type: 'number',
    required: true,
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Item removido do carrinho com sucesso.',
    type: Cart,
    schema: {
      example: {
        id: 1,
        userId: 1,
        items: [
          {
            id: 2,
            productId: 2,
            quantity: 1,
            product: {
              id: 2,
              name: 'Laptop ABC',
              price: 1499.99
            }
          }
        ],
        total: 1499.99,
        createdAt: '2024-03-06T12:00:00.000Z',
        updatedAt: '2024-03-06T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao remover item - O carrinho não pertence ao usuário'
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token inválido ou expirado'
  })
  @ApiResponse({
    status: 403,
    description: 'Proibido - Usuário sem permissão necessária'
  })
  @ApiResponse({
    status: 404,
    description: 'Carrinho ou item não encontrado'
  })
  async removeItem(
    @Param('cartId', ParseIntPipe) cartId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Request() req: RequestWithUser,
  ) {
    // First verify if this cart belongs to the user
    const userCart = await this.cartService.getUserCart(req.user.id);
    if (userCart.id !== cartId) {
      throw new BadRequestException('You can only modify your own cart');
    }
    return this.cartService.removeItem(cartId, productId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ 
    summary: 'Remover um carrinho completo',
    description: 'Remove completamente o carrinho especificado e todos os seus itens. Esta operação não pode ser desfeita.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID do carrinho a ser removido',
    type: 'number',
    required: true,
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Carrinho removido com sucesso.',
    schema: {
      example: {
        id: 1,
        userId: 1,
        items: [],
        total: 0,
        createdAt: '2024-03-06T12:00:00.000Z',
        updatedAt: '2024-03-06T12:00:00.000Z',
        deletedAt: '2024-03-06T12:30:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao remover carrinho - O carrinho não pertence ao usuário'
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token inválido ou expirado'
  })
  @ApiResponse({
    status: 403,
    description: 'Proibido - Usuário sem permissão necessária'
  })
  @ApiResponse({
    status: 404,
    description: 'Carrinho não encontrado'
  })
  async deleteCart(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    // First verify if this cart belongs to the user
    const userCart = await this.cartService.getUserCart(req.user.id);
    if (userCart.id !== id) {
      throw new BadRequestException('You can only delete your own cart');
    }
    return this.cartService.deleteCart(id);
  }
}
