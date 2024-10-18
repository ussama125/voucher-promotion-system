import {
  IsNumber,
  IsArray,
  ValidateNested,
  IsString,
  IsNotEmpty,
  Min,
  IsDecimal,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsInt()
  price: number;

  @IsString()
  category: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
