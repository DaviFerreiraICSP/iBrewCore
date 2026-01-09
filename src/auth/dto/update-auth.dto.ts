import { PartialType } from '@nestjs/mapped-types';
import { SignUpDto } from './signUp-auth.dto';

export class UpdateUserDto extends PartialType(SignUpDto) {}