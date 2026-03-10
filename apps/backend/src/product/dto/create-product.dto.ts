import { IsNotEmpty, IsNumber, MaxLength, MinLength, IsPositive, IsBoolean, IsOptional, IsString, IsUrl, IsArray, ValidateNested, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
    @IsNotEmpty()
    @MaxLength(100)
    @MinLength(3)
    name: string;

    @IsNotEmpty()
    @MaxLength(150)
    @MinLength(5)
    description: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    price: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    stock?: number;

    @IsOptional()
    @IsBoolean()
    trackStock?: boolean;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    categoryId?: number;
    @IsOptional()
    @IsBoolean()
    isBundle?: boolean;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BundleItemDto)
    bundleItems?: BundleItemDto[];
}

export class BundleItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}
    