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
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Criar um novo carrinho' })
  @ApiResponse({
    status: 201,
    description: 'Carrinho criado com sucesso.',
    type: Cart,
  })
  @ApiBadRequestResponse({ description: 'Usuário já possui um carrinho' })
  createCart(@Request() req: RequestWithUser) {
    return this.cartService.createCart(req.user.id);
  }

  @Get('my-cart')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Buscar o carrinho do usuário logado' })
  @ApiResponse({
    status: 200,
    description: 'Retorna o carrinho do usuário com seus itens e total.',
    type: Cart,
  })
  getMyCart(@Request() req: RequestWithUser) {
    return this.cartService.getUserCart(req.user.id);
  }

  @Post(':id/items')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Adicionar um item ao carrinho' })
  @ApiParam({
    name: 'id',
    description: 'ID do carrinho',
    type: 'number',
    required: true,
  })
  @ApiBody({
    type: AddItemDto,
    description: 'Dados do item a ser adicionado ao carrinho',
  })
  @ApiResponse({
    status: 201,
    description: 'Item adicionado ao carrinho com sucesso.',
    type: Cart,
  })
  @ApiResponse({
    status: 404,
    description: 'Carrinho ou produto não encontrado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Estoque insuficiente.',
  })
  async addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() addItemDto: AddItemDto,
    @Request() req: RequestWithUser,
  ) {
    // First verify if this cart belongs to the user
    const userCart = await this.cartService.getUserCart(req.user.id);
    if (userCart.id !== id) {
      throw new BadRequestException('You can only modify your own cart');
    }
    return this.cartService.addItem(id, addItemDto);
  }

  @Delete(':cartId/items/:productId')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Remover um item do carrinho' })
  @ApiParam({
    name: 'cartId',
    description: 'ID do carrinho',
    type: 'number',
    required: true,
  })
  @ApiParam({
    name: 'productId',
    description: 'ID do produto',
    type: 'number',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Item removido do carrinho com sucesso.',
    type: Cart,
  })
  @ApiResponse({
    status: 404,
    description: 'Carrinho ou item não encontrado.',
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
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Remover um carrinho completo' })
  @ApiParam({
    name: 'id',
    description: 'ID do carrinho',
    type: 'number',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Carrinho removido com sucesso.',
    type: Cart,
  })
  @ApiResponse({
    status: 404,
    description: 'Carrinho não encontrado.',
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
