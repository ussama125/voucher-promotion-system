import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voucher } from './voucher.entity';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { Order } from 'src/order/order.entity';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
  ) {}

  async create(createVoucherDto: CreateVoucherDto): Promise<Voucher> {
    if (
      createVoucherDto.discountType === 'percentage' &&
      createVoucherDto.discountValue > 100
    ) {
      throw new BadRequestException(
        'Discount value cannot be greater than 100%',
      );
    }
    const voucher = this.voucherRepository.create(createVoucherDto);
    return await this.voucherRepository.save(voucher);
  }

  async findAll(page: number = 1, size: number = 20) {
    const [data, count] = await this.voucherRepository.findAndCount({
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

  async findOne(id: number): Promise<Voucher> {
    const voucher = await this.voucherRepository.findOne({ where: { id } });

    if (!voucher) {
      throw new NotFoundException(`Voucher with ID ${id} not found`);
    }
    return voucher;
  }

  async findByCode(code: string): Promise<Voucher> {
    const voucher = await this.voucherRepository.findOne({ where: { code } });

    if (!voucher) {
      throw new NotFoundException(`Invalid voucher code: ${code}`);
    }
    return voucher;
  }

  async update(
    id: number,
    updateVoucherDto: UpdateVoucherDto,
  ): Promise<Voucher> {
    const result = await this.voucherRepository.update(id, updateVoucherDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Voucher with ID ${id} not found`);
    }
    return await this.voucherRepository.findOne({ where: { id } });
  }

  async updateUsageCount(
    voucherId: number,
    incrementBy: number,
  ): Promise<Voucher> {
    const voucher = await this.voucherRepository.findOne({
      where: { id: voucherId },
    });

    if (!voucher) {
      throw new NotFoundException(`Voucher with ID ${voucherId} not found`);
    }

    // Update usage count
    voucher.usageCount += incrementBy;

    // Ensure usageCount never goes negative
    if (voucher.usageCount < 0) {
      voucher.usageCount = 0;
    }

    return await this.voucherRepository.save(voucher);
  }

  async delete(id: number): Promise<void> {
    const result = await this.voucherRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Voucher with ID ${id} not found`);
    }
  }

  async applyVoucher(order: Order, promoCode: string) {
    const voucher = await this.voucherRepository.findOne({
      where: { code: promoCode },
    });

    if (!voucher) {
      throw new BadRequestException('Invalid voucher code');
    }

    this.validateVoucher(voucher, order);

    // Apply discount
    let discount = 0;
    const eligibleTotal = order.totalAmount;

    if (voucher.discountType === 'percentage') {
      discount = (voucher.discountValue / 100) * eligibleTotal;
    } else {
      discount = Math.min(voucher.discountValue, eligibleTotal);
    }

    // Ensure max discount is 50%
    // discount = Math.min(discount, eligibleTotal * 0.5);

    order.discount = discount;

    // Mark the voucher as used
    voucher.usageCount++;
    order.vouchers.push(voucher);
    await this.voucherRepository.save(voucher);

    return order;
  }

  private validateVoucher(voucher: Voucher, order: Order) {
    if (new Date() > voucher.expirationDate) {
      throw new BadRequestException('Voucher expired');
    }

    if (voucher.usageCount >= voucher.usageLimit) {
      throw new BadRequestException('Voucher usage limit reached');
    }

    if (
      voucher.minimumOrderValue &&
      order.totalAmount < voucher.minimumOrderValue
    ) {
      throw new BadRequestException(
        'Order total is below the minimum required for this voucher',
      );
    }

    if (order.vouchers.some((p) => p.id === voucher.id)) {
      throw new BadRequestException(
        'This voucher has already been applied to the order',
      );
    }
  }
}
