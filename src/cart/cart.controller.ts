import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
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
} from '@nestjs/swagger';
import { Cart } from './entities/cart.entity';

@ApiTags('Carrinho')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo carrinho' })
  @ApiResponse({
    status: 201,
    description: 'Carrinho criado com sucesso.',
    type: Cart,
  })
  createCart() {
    return this.cartService.createCart();
  }

  @Post(':id/items')
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
  addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() addItemDto: AddItemDto,
  ) {
    return this.cartService.addItem(id, addItemDto);
  }

  @Delete(':cartId/items/:productId')
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
  removeItem(
    @Param('cartId', ParseIntPipe) cartId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.cartService.removeItem(cartId, productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar detalhes do carrinho' })
  @ApiParam({
    name: 'id',
    description: 'ID do carrinho',
    type: 'number',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna os detalhes do carrinho com seus itens e total.',
    type: Cart,
  })
  @ApiResponse({
    status: 404,
    description: 'Carrinho não encontrado.',
  })
  getCart(@Param('id', ParseIntPipe) id: number) {
    return this.cartService.getCart(id);
  }
}
