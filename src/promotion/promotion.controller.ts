import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { Promotion } from './promotion.entity';

@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  create(@Body() promotionData: Partial<Promotion>): Promise<Promotion> {
    return this.promotionService.create(promotionData);
  }

  @Get()
  findAll(): Promise<Promotion[]> {
    return this.promotionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Promotion> {
    return this.promotionService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() promotionData: Partial<Promotion>,
  ): Promise<Promotion> {
    return this.promotionService.update(+id, promotionData);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.promotionService.delete(+id);
  }
}
