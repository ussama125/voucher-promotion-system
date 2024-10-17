import { Injectable, BadRequestException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(OrderService.name);
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

    this.logger.log({ orderId: order.id }, 'Order created successfully');
    return instanceToPlain(order);
  }

  async findOne(orderId: number): Promise<Order> {
    return this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
  }

  async applyVoucherToOrder(
    orderId: number,
    promotionCode: string,
  ): Promise<Order> {
    const order = await this.findOne(orderId);

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const appliedOrder = await this.voucherService.applyVoucher(
      order,
      promotionCode,
    );
    await this.orderRepository.save(appliedOrder);
    return appliedOrder;
  }

  async applyPromotionToOrder(
    orderId: number,
    promotionCode: string,
  ): Promise<Order> {
    const order = await this.findOne(orderId);

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const appliedOrder = await this.promotionService.applyPromotion(
      order,
      promotionCode,
    );
    await this.orderRepository.save(appliedOrder);
    return appliedOrder;
  }
}
