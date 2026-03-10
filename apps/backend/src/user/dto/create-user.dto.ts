import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsEnum } from "class-validator";
import { UserRole } from "../entities/user.entity";

export class CreateUserDto {
    
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    password: string;

    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
}
