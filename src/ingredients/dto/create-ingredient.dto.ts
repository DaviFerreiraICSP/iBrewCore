import { IsString, IsNotEmpty, IsObject, IsOptional, IsNumber, MaxLength, MinLength, IsArray } from 'class-validator';

export class CreateIngredientDto {

    @MinLength(3, { message: 'O Nome do Ingrediente deve ter pelo menos 3 caracteres' })
    @MaxLength(100, { message: 'O Nome do Ingrediente deve ter no máximo 100 caracteres' })
    @IsNotEmpty({ message: 'O Nome do Ingrediente é obrigatório'})
    @IsString()
    name: string;

    @IsNotEmpty({ message: 'A Unidade (g, ml, un) é obrigatória'})
    @IsString()
    unit: string;

    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'A Descrição do Ingrediente deve ter no máximo 255 caracteres' })
    description?: string;

    @IsOptional()
    @IsNumber()
    stockQTY: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    recipes?: string[];

}
