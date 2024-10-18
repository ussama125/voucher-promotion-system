import { Controller, Post, Body, Param } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApplyCodeDto } from './dto/apply-code.dts';

@ApiTags('order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Post(':id/apply-voucher')
  async applyVoucher(@Param('id') id: string, @Body() body: ApplyCodeDto) {
    return this.orderService.applyVoucherToOrder(+id, body.code);
  }

  @Post(':id/apply-promotion')
  async applyPromotion(@Param('id') id: string, @Body() body: ApplyCodeDto) {
    return this.orderService.applyPromotionToOrder(+id, body.code);
  }
}
