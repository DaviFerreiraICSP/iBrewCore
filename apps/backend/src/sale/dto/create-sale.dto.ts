import { IsArray, IsInt, IsNotEmpty, IsNumber, Min, ValidateNested, IsString, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class CreateSaleItemDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}

export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  @IsNotEmpty()
  items: CreateSaleItemDto[];

  @IsNotEmpty()
  @IsString()
  @IsIn(['CASH', 'CARD', 'PIX', 'OTHER'])
  paymentMethod: string;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'PAID', 'FAILED', 'REFUNDED'])
  paymentStatus?: string;
}
