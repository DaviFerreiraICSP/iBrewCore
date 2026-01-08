import { PartialType } from '@nestjs/mapped-types';
import { SignUpDto } from './signUp-auth.dto';

export class LoginDto extends PartialType(SignUpDto) {}
