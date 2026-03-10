import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from '../sale/entities/sale.entity';
import { SaleItem } from '../sale/entities/sale-item.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem, Product])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
