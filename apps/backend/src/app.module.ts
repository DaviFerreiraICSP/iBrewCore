import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { SaleModule } from './sale/sale.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';

import { ConfigModule } from '@nestjs/config';
import { AuditModule } from './audit/audit.module';
import { CategoryModule } from './category/category.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UploadModule } from './upload/upload.module';
import { SettingsModule } from './settings/settings.module';

import config from './ormconfig';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(config),
    ProductModule,
    UserModule,
    SaleModule,
    AuthModule,
    MailModule,
    AuditModule,
    CategoryModule,
    DashboardModule,
    UploadModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
