import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/signUp-auth.dto';
import { LoginDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateUserDto } from './dto/update-auth.dto';
import { PrismaClient } from 'src/prisma/generated';

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private JwtService: JwtService
  ) { }

  async createUser(signUpDto: SignUpDto) {
    const alreadyExists = await this.prisma.user.findUnique({
      where: { email: signUpDto.email }
    })

    if (alreadyExists) {
      throw new Error('User Already Exists')
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(signUpDto.password, salt);

    return this.prisma.user.create({
      data: {
        ...signUpDto,
        password: hashedPassword
      }
    });
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {  email: loginDto.email }
    })

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const isMatch = await bcrypt.compare(loginDto.password!, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid Credentials');
    
    const payload = { 
      sub: user.id,
      email: user.email,
      role: user.role
    };

    return {
      access_token: this.JwtService.sign(payload),
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: id } });

    if (!user) {
      throw new Error('User Not Found');
    }

    if (user.role !== 'ADMIN') {
      throw new UnauthorizedException('Unauthorized Action');
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }


    if (updateUserDto.email) {
      const emailExists = await this.prisma.user.findFirst({
        where: { 
          email: updateUserDto.email, 
          id: { not: id }
         }
      });
      if (emailExists) {
        throw new Error('Email Already In Use');
      }
    }

    return this.prisma.user.update({
      where: { id: id },
      data: updateUserDto
    })

  }

  async deleteUser(id: string) {
    const idUser = await this.prisma.user.findUnique({
      where: { id: id}
    })

    if (!idUser) {
      throw new Error('User Not Found');
    }
    if (idUser.role !== 'ADMIN') {
      throw new UnauthorizedException('Unauthorized Action');
    }

    return this.prisma.user.delete({
      where: { id: id }
    });
  }

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });
    if (!user) {
      throw new Error('User Not Found');
    }
    return user;
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });
  }

}