import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { Type } from "class-transformer"
import { MaxLength, IsNotEmpty, MinLength, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

