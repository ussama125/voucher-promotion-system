import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './promotion.entity';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
  ) {}

  async create(promotionData: Partial<Promotion>): Promise<Promotion> {
    const promotion = this.promotionRepository.create(promotionData);
    return this.promotionRepository.save(promotion);
  }

  async findAll(): Promise<Promotion[]> {
    return this.promotionRepository.find();
  }

  async findOne(id: number): Promise<Promotion> {
    return this.promotionRepository.findOne({ where: { id } });
  }

  async findByCode(code: string): Promise<Promotion> {
    return this.promotionRepository.findOne({ where: { code } });
  }

  async update(
    id: number,
    promotionData: Partial<Promotion>,
  ): Promise<Promotion> {
    await this.promotionRepository.update(id, promotionData);
    return this.promotionRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.promotionRepository.delete(id);
  }
}
