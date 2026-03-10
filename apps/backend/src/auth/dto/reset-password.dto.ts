import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsOptional()
    twoFactorToken?: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    newPassword: string;
}
