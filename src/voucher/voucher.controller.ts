import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { Voucher } from './voucher.entity';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post()
  create(@Body() voucherData: Partial<Voucher>): Promise<Voucher> {
    return this.voucherService.create(voucherData);
  }

  @Get()
  findAll(): Promise<Voucher[]> {
    return this.voucherService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Voucher> {
    return this.voucherService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() voucherData: Partial<Voucher>,
  ): Promise<Voucher> {
    return this.voucherService.update(+id, voucherData);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.voucherService.delete(+id);
  }
}
