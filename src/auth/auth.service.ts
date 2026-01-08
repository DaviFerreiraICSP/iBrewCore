import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/signUp-auth.dto';
import { LoginDto } from './dto/login-auth.dto';
import { PrismaClient } from '@prisma/client/extension';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async createUser(signUpDto: SignUpDto) {
    const alreadyExists = await this.prisma.user.findUnique({
      where: { email: signUpDto.email }
    })

    if (alreadyExists) {
      throw new Error('User Already Exists')
    }

    return this.prisma.user.create({
      data: {
        name: signUpDto.name,
        email: signUpDto.email,
        password: signUpDto.password,
      }
    })
  }

}