import { IsString, IsNotEmpty } from 'class-validator';

export class ApplyCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
