import { IsNumber, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsString()
  category: string;
}

export class CreateOrderDto {
  @IsNumber()
  totalAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
