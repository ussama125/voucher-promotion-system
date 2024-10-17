import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { VoucherModule } from 'src/voucher/voucher.module';
import { PromotionModule } from 'src/promotion/promotion.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), VoucherModule, PromotionModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
