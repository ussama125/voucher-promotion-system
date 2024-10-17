import { Controller, Post, Body, Param, Put } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Put(':id/apply-voucher/:code')
  async applyVoucher(@Param('id') id: string, @Param('code') code: string) {
    return this.orderService.applyVoucherToOrder(+id, code);
  }

  @Put(':id/apply-promotion/:code')
  async applyPromotion(@Param('id') id: string, @Param('code') code: string) {
    return this.orderService.applyPromotionToOrder(+id, code);
  }
}
