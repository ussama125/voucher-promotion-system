import {
  BadRequestException,
  Injectable,
  Logger,
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
  private readonly logger = new Logger(VoucherService.name);

  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
  ) {}

  async create(createVoucherDto: CreateVoucherDto): Promise<Voucher> {
    this.logger.log({ createVoucherDto }, 'Creating a new voucher');
    if (
      createVoucherDto.discountType === 'percentage' &&
      createVoucherDto.discountValue > 100
    ) {
      throw new BadRequestException(
        'Discount value cannot be greater than 100%',
      );
    }
    const voucher = this.voucherRepository.create(createVoucherDto);
    const savedVoucher = await this.voucherRepository.save(voucher);
    this.logger.log(
      { voucherId: savedVoucher.id },
      'Voucher created successfully',
    );
    return savedVoucher;
  }

  async findAll(page: number = 1, size: number = 20) {
    this.logger.debug({ page, size }, 'Retrieving vouchers');
    const [data, count] = await this.voucherRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
    });

    this.logger.log({ count }, 'Vouchers retrieved successfully');
    return {
      page,
      size,
      count,
      data,
    };
  }

  async findOne(id: number): Promise<Voucher> {
    this.logger.debug({ id }, 'Retrieving voucher by ID');
    const voucher = await this.voucherRepository.findOne({ where: { id } });

    if (!voucher) {
      this.logger.error({ id }, 'Voucher not found');
      throw new NotFoundException(`Voucher with ID ${id} not found`);
    }

    this.logger.log({ id }, 'Voucher retrieved successfully');
    return voucher;
  }

  async findByCode(code: string): Promise<Voucher> {
    this.logger.debug({ code }, 'Retrieving voucher by code');
    const voucher = await this.voucherRepository.findOne({ where: { code } });

    if (!voucher) {
      this.logger.error({ code }, 'Voucher code is invalid');
      throw new NotFoundException(`Invalid voucher code: ${code}`);
    }

    this.logger.log({ code }, 'Voucher retrieved by code successfully');
    return voucher;
  }

  async update(
    id: number,
    updateVoucherDto: UpdateVoucherDto,
  ): Promise<Voucher> {
    this.logger.debug({ id, updateVoucherDto }, 'Updating voucher');
    const result = await this.voucherRepository.update(id, updateVoucherDto);
    if (result.affected === 0) {
      this.logger.error({ id }, 'Voucher not found for update');
      throw new NotFoundException(`Voucher with ID ${id} not found`);
    }

    const updatedVoucher = await this.voucherRepository.findOne({
      where: { id },
    });
    this.logger.log({ id }, 'Voucher updated successfully');
    return updatedVoucher;
  }

  async updateUsageCount(
    voucherId: number,
    incrementBy: number,
  ): Promise<Voucher> {
    this.logger.debug(
      { voucherId, incrementBy },
      'Updating voucher usage count',
    );
    const voucher = await this.voucherRepository.findOne({
      where: { id: voucherId },
    });

    if (!voucher) {
      throw new NotFoundException(`Voucher with ID ${voucherId} not found`);
    }

    voucher.usageCount += incrementBy;

    // Ensure usageCount never goes negative
    if (voucher.usageCount < 0) {
      voucher.usageCount = 0;
    }

    const updatedVoucher = await this.voucherRepository.save(voucher);
    this.logger.log(
      { voucherId, usageCount: updatedVoucher.usageCount },
      'Voucher usage count updated',
    );
    return updatedVoucher;
  }

  async delete(id: number): Promise<void> {
    this.logger.debug({ id }, 'Deleting voucher');
    const result = await this.voucherRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Voucher with ID ${id} not found`);
    }
    this.logger.log({ id }, 'Voucher deleted successfully');
  }

  async applyVoucher(order: Order, promoCode: string) {
    this.logger.debug({ promoCode }, 'Applying voucher to order');
    const voucher = await this.voucherRepository.findOne({
      where: { code: promoCode },
    });

    if (!voucher) {
      throw new BadRequestException('Invalid voucher code');
    }

    this.validateVoucher(voucher, order);

    let discount = 0;
    const eligibleTotal = Number(order.totalAmount);
    order.discount = order.discount ? Number(order.discount) : 0;

    let eligibleQuantity = 0;
    order.items.forEach((item) => {
      eligibleQuantity += item.quantity;
    });

    if (voucher.discountType === 'percentage') {
      discount = (voucher.discountValue / 100) * eligibleTotal;
    } else {
      discount = Math.min(
        voucher.discountValue * eligibleQuantity,
        eligibleTotal,
      );
    }

    console.log('*******', discount, eligibleTotal, order.discount);

    order.discount += discount;
    order.discount = Math.min(order.discount, order.totalAmount);

    voucher.usageCount++;
    order.vouchers.push(voucher);
    await this.voucherRepository.save(voucher);

    this.logger.log(
      { promoCode, orderId: order.id, discount },
      'Voucher applied successfully',
    );
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
