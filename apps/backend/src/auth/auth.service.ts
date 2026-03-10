import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { verifySync, generateSecret, generateURI } from 'otplib';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, ...rest } = createUserDto;
    
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      ...rest,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    
    return this.login({ email, password });
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'name', 'email', 'password', 'role', 'isTwoFactorEnabled', 'avatarUrl'] 
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        avatarUrl: user.avatarUrl,
      }
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({ 
        where: { email: forgotPasswordDto.email } 
    });

    if (!user) {
      // For security, don't reveal if user exists
      return { message: 'If an account exists with this email, a recovery code has been sent.' };
    }

    // Generate 6 digit code
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(recoveryCode, 10);
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    user.recoveryCode = hashedCode;
    user.recoveryCodeExpires = expires;
    await this.userRepository.save(user);

    await this.mailService.sendRecoveryCode(user.email, recoveryCode);

    return { 
        message: 'Recovery code sent successfully',
        requiresTwoFactor: user.isTwoFactorEnabled 
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, code, twoFactorToken, newPassword } = resetPasswordDto;
    
    // 1. Find user with recovery fields
    const user = await this.userRepository.findOne({ 
        where: { email },
        select: ['id', 'email', 'password', 'isTwoFactorEnabled', 'twoFactorSecret', 'recoveryCode', 'recoveryCodeExpires']
    });

    if (!user || !user.recoveryCode || !user.recoveryCodeExpires) {
      throw new BadRequestException('Invalid recovery session');
    }

    // 2. Check expiration
    if (new Date() > user.recoveryCodeExpires) {
      throw new BadRequestException('Recovery code expired');
    }

    // 3. Verify Email Code
    const isCodeValid = await bcrypt.compare(code, user.recoveryCode);
    if (!isCodeValid) {
      throw new BadRequestException('Invalid recovery code');
    }

    // 4. Verify 2FA if enabled
    if (user.isTwoFactorEnabled) {
      if (!twoFactorToken) {
        throw new UnauthorizedException('Two-factor authentication token required');
      }
      
      if (!user.twoFactorSecret) {
          throw new UnauthorizedException('Invalid 2FA configuration');
      }

      const is2FAValid = verifySync({
        token: twoFactorToken,
        secret: user.twoFactorSecret,
      });

      if (!is2FAValid) {
        throw new UnauthorizedException('Invalid 2FA token');
      }
    }

    // 5. Update Password
    user.password = await bcrypt.hash(newPassword, 10);
    user.recoveryCode = undefined;
    user.recoveryCodeExpires = undefined;
    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }

  async generateTwoFactorSecret(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const secret = generateSecret();
    const otpauthUrl = generateURI({
        secret,
        label: user.email,
        issuer: 'iBrew',
    });

    user.twoFactorSecret = secret;
    await this.userRepository.save(user);

    return { secret, otpauthUrl };
  }

  async enableTwoFactor(userId: number, token: string) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'email', 'twoFactorSecret', 'isTwoFactorEnabled']
    });
    
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA not initialized');
    }

    const isValid = verifySync({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid token');
    }

    user.isTwoFactorEnabled = true;
    await this.userRepository.save(user);

    return { message: '2FA enabled successfully' };
  }

}
