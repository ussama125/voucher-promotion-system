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
  eligibleCategories: string[];

  @IsEnum(['percentage', 'fixed'])
  discountType: 'percentage' | 'fixed';

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsDateString()
  @IsNotEmpty()
  expirationDate: Date;

  @IsNumber()
  @Min(1)
  usageLimit: number;
}
