import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { VoucherService } from '../voucher/voucher.service';
import { PromotionService } from '../promotion/promotion.service';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private promotionService: PromotionService,
    private voucherService: VoucherService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<any> {
    const { items } = createOrderDto;

    // Calculate total price based on items
    const totalPrice = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    const order = new Order();
    order.totalAmount = totalPrice;

    // Map items to OrderItem entities
    const orderItems = items.map((item) => {
      const orderItem = new OrderItem();
      orderItem.productId = item.productId;
      orderItem.quantity = item.quantity;
      orderItem.price = item.price;
      orderItem.category = item.category;
      orderItem.order = order;
      return orderItem;
    });

    order.items = orderItems;

    // Save order and items
    await this.orderRepository.save(order);
    await this.orderItemRepository.save(orderItems);

    return instanceToPlain(order);
  }

  async findOne(orderId: number): Promise<Order> {
    return this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
  }

  async saveOrder(order: Order): Promise<Order> {
    return this.orderRepository.save(order);
  }

  async applyVoucherToOrder(
    orderId: number,
    voucherCode: string,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['vouchers'],
    });
    const voucher = await this.voucherService.findByCode(voucherCode);

    if (!order || !voucher) {
      throw new BadRequestException('Order or voucher not found');
    }

    if (voucher.expirationDate < new Date()) {
      throw new BadRequestException('Voucher has expired');
    }

    if (voucher.usageCount >= voucher.usageLimit) {
      throw new BadRequestException('Voucher usage limit exceeded');
    }

    if (
      voucher.minimumOrderValue &&
      order.totalAmount < voucher.minimumOrderValue
    ) {
      throw new BadRequestException(
        'Order total is below the minimum required for this voucher',
      );
    }

    if (order.vouchers.some((v) => v.id === voucher.id)) {
      throw new BadRequestException(
        'This voucher has already been applied to the order',
      );
    }

    let discountAmount: number;
    if (voucher.discountType === 'percentage') {
      discountAmount = order.totalAmount * (voucher.discountValue / 100);
    } else {
      discountAmount = voucher.discountValue;
    }

    // Ensure the discount doesn't exceed 50% of the order total
    const maxDiscount = order.totalAmount * 0.5;
    discountAmount = Math.min(discountAmount, maxDiscount);

    order.totalAmount -= discountAmount;
    order.vouchers.push(voucher);
    voucher.usageCount++;

    await this.voucherService.updateUsageCount(voucher.id, 1);
    return this.orderRepository.save(order);
  }

  async applyPromotionToOrder(
    orderId: number,
    promotionCode: string,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['promotions'],
    });
    const promotion = await this.promotionService.findByCode(promotionCode);

    if (!order || !promotion) {
      throw new BadRequestException('Order or promotion not found');
    }

    if (promotion.expirationDate < new Date()) {
      throw new BadRequestException('Promotion has expired');
    }

    if (promotion.usageCount >= promotion.usageLimit) {
      throw new BadRequestException('Promotion usage limit exceeded');
    }

    if (order.promotions.some((p) => p.id === promotion.id)) {
      throw new BadRequestException(
        'This promotion has already been applied to the order',
      );
    }

    // Check if the order contains eligible products
    const hasEligibleProducts = order.items.some((item) =>
      promotion.eligibleIds.includes(item.category),
    );

    if (!hasEligibleProducts) {
      throw new BadRequestException('No eligible products for this promotion');
    }

    let discountAmount: number;
    if (promotion.discountType === 'percentage') {
      discountAmount = order.totalAmount * (promotion.discountValue / 100);
    } else {
      discountAmount = promotion.discountValue;
    }

    // Ensure the discount doesn't exceed 50% of the order total
    const maxDiscount = order.totalAmount * 0.5;
    discountAmount = Math.min(discountAmount, maxDiscount);

    order.totalAmount -= discountAmount;
    order.promotions.push(promotion);
    promotion.usageCount++;

    await this.promotionService.updateUsageCount(promotion.id, 1);
    return this.orderRepository.save(order);
  }
}
