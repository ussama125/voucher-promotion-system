import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voucher } from './voucher.entity';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
  ) {}

  async create(voucherData: Partial<Voucher>): Promise<Voucher> {
    const voucher = this.voucherRepository.create(voucherData);
    return this.voucherRepository.save(voucher);
  }

  async findAll(): Promise<Voucher[]> {
    return this.voucherRepository.find();
  }

  async findOne(id: number): Promise<Voucher> {
    return this.voucherRepository.findOne({ where: { id } });
  }

  async findByCode(code: string): Promise<Voucher> {
    return this.voucherRepository.findOne({ where: { code } });
  }

  async update(id: number, voucherData: Partial<Voucher>): Promise<Voucher> {
    await this.voucherRepository.update(id, voucherData);
    return this.voucherRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.voucherRepository.delete(id);
  }
}
