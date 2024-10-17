import {
  IsString,
  IsEnum,
  IsNumber,
  IsDate,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  code: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  eligibleCategories: string[];

  @IsEnum(['percentage', 'fixed'])
  discountType: 'percentage' | 'fixed';

  @IsNumber()
  discountValue: number;

  @IsDate()
  expirationDate: Date;

  @IsNumber()
  @Min(1)
  usageLimit: number;
}
