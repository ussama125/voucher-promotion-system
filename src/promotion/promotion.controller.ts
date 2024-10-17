import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { Promotion } from './promotion.entity';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Promotion')
@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  create(@Body() promotionData: CreatePromotionDto): Promise<Promotion> {
    return this.promotionService.create(promotionData);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('size') size = 20) {
    return this.promotionService.findAll(Number(page), Number(size));
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Promotion> {
    return this.promotionService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() promotionData: UpdatePromotionDto,
  ): Promise<Promotion> {
    return this.promotionService.update(+id, promotionData);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.promotionService.delete(+id);
  }
}
