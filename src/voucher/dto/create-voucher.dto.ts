import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateVoucherDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(['percentage', 'fixed'])
  @IsNotEmpty()
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

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderValue?: number;
}
