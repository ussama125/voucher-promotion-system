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
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post()
  create(@Body() voucherData: CreateVoucherDto): Promise<Voucher> {
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
    @Body() voucherData: UpdateVoucherDto,
  ): Promise<Voucher> {
    return this.voucherService.update(+id, voucherData);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.voucherService.delete(+id);
  }
}
