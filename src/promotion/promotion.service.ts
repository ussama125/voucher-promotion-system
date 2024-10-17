import {
  BadRequestException,
  Injectable,
  NotFoundException,
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
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
  ) {}

  async create(promotionData: CreatePromotionDto): Promise<Promotion> {
    if (
      promotionData.discountType === 'percentage' &&
      promotionData.discountValue > 100
    ) {
      throw new BadRequestException(
        'Discount value cannot be greater than 100%',
      );
    }
    const promotion = this.promotionRepository.create(promotionData);
    return this.promotionRepository.save(promotion);
  }

  async findAll(page: number = 1, size: number = 20) {
    const [data, count] = await this.promotionRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
    });

    return {
      page,
      size,
      count,
      data,
    };
  }

  async findOne(id: number): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({ where: { id } });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return promotion;
  }

  async findByCode(code: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { code },
    });

    if (!promotion) {
      throw new NotFoundException(`Invalid promotion code: ${code}`);
    }
    return promotion;
  }

  async update(
    id: number,
    updatePromotionDto: UpdatePromotionDto,
  ): Promise<Promotion> {
    const result = await this.promotionRepository.update(
      id,
      updatePromotionDto,
    );
    if (result.affected === 0) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return await this.promotionRepository.findOne({ where: { id } });
  }

  async updateUsageCount(
    promotionId: number,
    incrementBy: number,
  ): Promise<Promotion> {
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

    return await this.promotionRepository.save(promotion);
  }

  async delete(id: number): Promise<void> {
    const result = await this.promotionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
  }

  async applyPromotion(order: Order, promoCode: string) {
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

    if (promotion.discountType === 'percentage') {
      discount = (promotion.discountValue / 100) * eligibleTotal;
    } else {
      discount = Math.min(promotion.discountValue, eligibleTotal);
    }

    // Ensure max discount is 50%
    // discount = Math.min(discount, eligibleTotal * 0.5);

    order.discount = discount;

    // Mark the promotion as used
    promotion.usageCount++;
    order.promotions.push(promotion);
    await this.promotionRepository.save(promotion);

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
