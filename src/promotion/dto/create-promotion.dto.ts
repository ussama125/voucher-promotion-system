import {
  IsString,
  IsEnum,
  IsNumber,
  IsDate,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
  Min,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  code: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  eligibleIds: string[];

  @IsEnum(['products', 'categories'])
  eligibleOn: string;

  @IsEnum(['percentage', 'fixed'])
  discountType: string;

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsDateString()
  @IsNotEmpty()
  expirationDate: string;

  @IsNumber()
  @Min(1)
  usageLimit: number;
}
