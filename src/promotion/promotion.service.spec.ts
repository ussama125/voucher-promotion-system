import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PromotionService } from './promotion.service';
import { Promotion } from './promotion.entity';
import { Repository } from 'typeorm';
import { Order } from 'src/order/order.entity';
import { OrderItem } from 'src/order/entities/order-item.entity';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';

const mockPromotionRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('PromotionService', () => {
  let service: PromotionService;
  let promotionRepository: MockRepository<Promotion>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionService,
        {
          provide: getRepositoryToken(Promotion),
          useValue: mockPromotionRepository(),
        },
      ],
    }).compile();

    service = module.get<PromotionService>(PromotionService);
    promotionRepository = module.get<MockRepository<Promotion>>(
      getRepositoryToken(Promotion),
    );
  });

  describe('create', () => {
    it('should create a new promotion', async () => {
      const createPromotionDto = {
        code: 'P_100',
        eligibleIds: ['a'],
        eligibleOn: 'categories',
        discountType: 'fixed',
        discountValue: 100,
        expirationDate: '2024-11-30T23:59:59.000Z',
        usageLimit: 10,
      };
      const savedPromotion = { id: 1, ...createPromotionDto };

      promotionRepository.create.mockReturnValue(savedPromotion);
      promotionRepository.save.mockResolvedValue(savedPromotion);

      const result = await service.create(createPromotionDto);

      expect(promotionRepository.create).toHaveBeenCalledWith(
        createPromotionDto,
      );
      expect(promotionRepository.save).toHaveBeenCalledWith(savedPromotion);
      expect(result).toEqual(savedPromotion);
    });

    it('should throw BadRequestException if discount value is greater than 100%', async () => {
      const createPromotionDto = {
        code: 'P_100',
        eligibleIds: ['a'],
        eligibleOn: 'categories',
        discountType: 'percentage',
        discountValue: 120,
        expirationDate: '2024-11-30T23:59:59.000Z',
        usageLimit: 10,
      };

      await expect(service.create(createPromotionDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated promotions', async () => {
      const promotions = [{ id: 1 }, { id: 2 }];
      const page = 1;
      const size = 2;

      promotionRepository.findAndCount.mockResolvedValue([
        promotions,
        promotions.length,
      ]);

      const result = await service.findAll(page, size);

      expect(promotionRepository.findAndCount).toHaveBeenCalledWith({
        skip: (page - 1) * size,
        take: size,
      });
      expect(result).toEqual({
        page,
        size,
        count: promotions.length,
        data: promotions,
      });
    });
  });

  describe('findOne', () => {
    it('should return a promotion by ID', async () => {
      const promotion = { id: 1 };
      promotionRepository.findOne.mockResolvedValue(promotion);

      const result = await service.findOne(1);

      expect(promotionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(promotion);
    });

    it('should throw NotFoundException if promotion is not found', async () => {
      promotionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCode', () => {
    it('should return a promotion by code', async () => {
      const promotion = { code: 'PROMO50' };
      promotionRepository.findOne.mockResolvedValue(promotion);

      const result = await service.findByCode('PROMO50');

      expect(promotionRepository.findOne).toHaveBeenCalledWith({
        where: { code: 'PROMO50' },
      });
      expect(result).toEqual(promotion);
    });

    it('should throw NotFoundException if promotion code is not found', async () => {
      promotionRepository.findOne.mockResolvedValue(null);

      await expect(service.findByCode('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a promotion', async () => {
      const updatePromotionDto = { discountValue: 30 };
      const updatedPromotion = { id: 1, discountValue: 30 };

      promotionRepository.update.mockResolvedValue({ affected: 1 });
      promotionRepository.findOne.mockResolvedValue(updatedPromotion);

      const result = await service.update(1, updatePromotionDto);

      expect(promotionRepository.update).toHaveBeenCalledWith(
        1,
        updatePromotionDto,
      );
      expect(result).toEqual(updatedPromotion);
    });

    it('should throw NotFoundException if promotion is not found for update', async () => {
      promotionRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.update(1, { discountValue: 30 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUsageCount', () => {
    it('should update promotion usage count', async () => {
      const promotion = { id: 1, usageCount: 1 };
      const updatedPromotion = { id: 1, usageCount: 2 };

      promotionRepository.findOne.mockResolvedValue(promotion);
      promotionRepository.save.mockResolvedValue(updatedPromotion);

      const result = await service.updateUsageCount(1, 1);

      expect(promotionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(promotionRepository.save).toHaveBeenCalledWith(promotion);
      expect(result).toEqual(updatedPromotion);
    });

    it('should throw NotFoundException if promotion is not found', async () => {
      promotionRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUsageCount(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a promotion', async () => {
      promotionRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(1);

      expect(promotionRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if promotion is not found for deletion', async () => {
      promotionRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('applyPromotion', () => {
    it('should throw BadRequestException for invalid promo code', async () => {
      promotionRepository.findOne.mockResolvedValue(null);

      const order = { id: 1, items: [] } as Order;

      await expect(service.applyPromotion(order, 'INVALID')).rejects.toThrow(
        BadRequestException,
      );
    });

    // Additional cases for expired promotion, usage limit, and no eligible items can be added similarly
  });
});
