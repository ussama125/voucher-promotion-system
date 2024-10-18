import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { OrderItem } from 'src/order/entities/order-item.entity';
import { Order } from 'src/order/order.entity';

@Injectable()
export class PromotionService {
  private readonly logger = new Logger(PromotionService.name);

  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
  ) {}

  async create(promotionData: CreatePromotionDto): Promise<Promotion> {
    this.logger.log('Creating a new promotion');

    if (
      promotionData.discountType === 'percentage' &&
      promotionData.discountValue > 100
    ) {
      throw new BadRequestException(
        'Discount value cannot be greater than 100%',
      );
    }

    const promotion = this.promotionRepository.create(promotionData);
    const savedPromotion = await this.promotionRepository.save(promotion);
    this.logger.log(`Promotion created with ID: ${savedPromotion.id}`);
    return savedPromotion;
  }

  async findAll(page: number = 1, size: number = 20) {
    this.logger.log(`Fetching promotions: page ${page}, size ${size}`);
    const [data, count] = await this.promotionRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
    });

    this.logger.log(`Found ${count} promotions`);
    return {
      page,
      size,
      count,
      data,
    };
  }

  async findOne(id: number): Promise<Promotion> {
    this.logger.log(`Fetching promotion with ID: ${id}`);
    const promotion = await this.promotionRepository.findOne({ where: { id } });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    this.logger.log(`Found promotion with ID: ${id}`);
    return promotion;
  }

  async findByCode(code: string): Promise<Promotion> {
    this.logger.log(`Fetching promotion with code: ${code}`);
    const promotion = await this.promotionRepository.findOne({
      where: { code },
    });

    if (!promotion) {
      throw new NotFoundException(`Invalid promotion code: ${code}`);
    }
    this.logger.log(`Found promotion with code: ${code}`);
    return promotion;
  }

  async update(
    id: number,
    updatePromotionDto: UpdatePromotionDto,
  ): Promise<Promotion> {
    this.logger.log(`Updating promotion with ID: ${id}`);
    const result = await this.promotionRepository.update(
      id,
      updatePromotionDto,
    );

    if (result.affected === 0) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    const updatedPromotion = await this.promotionRepository.findOne({
      where: { id },
    });
    this.logger.log(`Promotion with ID ${id} updated`);
    return updatedPromotion;
  }

  async updateUsageCount(
    promotionId: number,
    incrementBy: number,
  ): Promise<Promotion> {
    this.logger.log(`Updating usage count for promotion ID: ${promotionId}`);
    const promotion = await this.promotionRepository.findOne({
      where: { id: promotionId },
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${promotionId} not found`);
    }

    // Update usage count
    promotion.usageCount += incrementBy;

    // Ensure usageCount never goes negative
    if (promotion.usageCount < 0) {
      promotion.usageCount = 0;
    }

    const updatedPromotion = await this.promotionRepository.save(promotion);
    this.logger.log(`Usage count updated for promotion ID: ${promotionId}`);
    return updatedPromotion;
  }

  async delete(id: number): Promise<void> {
    this.logger.log(`Deleting promotion with ID: ${id}`);
    const result = await this.promotionRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    this.logger.log(`Promotion with ID ${id} deleted`);
  }

  async applyPromotion(order: Order, promoCode: string) {
    this.logger.log(
      `Applying promotion with code: ${promoCode} to order ID: ${order.id}`,
    );
    const promotion = await this.promotionRepository.findOne({
      where: { code: promoCode },
    });

    if (!promotion) {
      throw new BadRequestException('Invalid promotion code');
    }

    this.validatePromotion(promotion, order);

    // Check eligibility for categories/items
    const eligibleItems = order.items.filter((item: OrderItem) => {
      if (promotion.eligibleOn === 'products') {
        return promotion.eligibleIds.includes(item.productId);
      } else if (promotion.eligibleOn === 'categories') {
        return promotion.eligibleIds.includes(item.category);
      }
      return false;
    });

    if (eligibleItems.length === 0) {
      throw new BadRequestException('No eligible items for this promotion');
    }

    // Apply discount
    let discount = 0;
    const eligibleTotal = eligibleItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    let eligibleQuantity = 0;
    eligibleItems.forEach((item) => {
      eligibleQuantity += item.quantity;
    });

    order.totalAmount = Number(order.totalAmount);
    order.discount = order.discount ? Number(order.discount) : 0;

    if (promotion.discountType === 'percentage') {
      discount = (promotion.discountValue / 100) * eligibleTotal;
    } else {
      discount = Math.min(
        eligibleQuantity * promotion.discountValue,
        eligibleTotal,
      );
    }

    // Ensure max discount is 50%
    // discount = Math.min(discount, eligibleTotal * 0.5);

    console.log('*******', discount, eligibleTotal, order.discount);

    order.discount += discount;
    order.discount = Math.min(order.discount, eligibleTotal);

    // Mark the promotion as used
    promotion.usageCount++;
    order.promotions.push(promotion);
    await this.promotionRepository.save(promotion);

    this.logger.log(
      `Promotion with code: ${promoCode} applied to order ID: ${order.id}`,
    );
    return order;
  }

  private validatePromotion(promotion: Promotion, order: Order) {
    if (new Date() > promotion.expirationDate) {
      throw new BadRequestException('Promotion expired');
    }

    if (promotion.usageCount >= promotion.usageLimit) {
      throw new BadRequestException('Promotion usage limit reached');
    }

    if (order.promotions.some((p) => p.id === promotion.id)) {
      throw new BadRequestException(
        'This promotion has already been applied to the order',
      );
    }
  }
}
