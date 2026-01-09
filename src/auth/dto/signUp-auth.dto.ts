import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from "class-validator";


export class SignUpDto {

    @IsString()
    @MinLength(3, { message: 'Name must be at least 3 characters long' }) 
    name: string;

    @IsEmail()
    email: string;

    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/, { message: 'Senha fraca! A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial' })
    @MaxLength(20, { message: 'A senha deve ter no máximo 20 caracteres' })
    @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
    password: string;
    
    @IsOptional()
    @IsEnum(['SELLER', 'ADMIN', 'CUSTOMER'], { message: 'Role must be either SELLER, ADMIN, or CUSTOMER' })
    role: 'SELLER' | 'ADMIN' | 'CUSTOMER';
}
