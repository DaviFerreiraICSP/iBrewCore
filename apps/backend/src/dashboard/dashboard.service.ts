import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Sale } from '../sale/entities/sale.entity';
import { Product } from '../product/entities/product.entity';
import { SaleItem } from '../sale/entities/sale-item.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,
  ) {}

  async getSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = await this.saleRepository.find({
      where: { createdAt: MoreThanOrEqual(today) },
    });

    const totalRevenueToday = todaySales.reduce((acc, sale) => acc + Number(sale.total), 0);
    const totalSalesCountToday = todaySales.length;

    // Top 5 Products
    const topProducts = await this.saleItemRepository
      .createQueryBuilder('item')
      .select('item.productId', 'productId')
      .addSelect('product.name', 'name')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .innerJoin('item.product', 'product')
      .groupBy('item.productId')
      .addGroupBy('product.name')
      .orderBy('totalQuantity', 'DESC')
      .limit(5)
      .getRawMany();

    const lowStockProducts = await this.productRepository.find({
        where: { trackStock: true, stock: Between(0, 5) },
        take: 5
    });

    return {
      revenueToday: totalRevenueToday,
      salesCountToday: totalSalesCountToday,
      topProducts,
      lowStock: lowStockProducts,
    };
  }

  async getSalesChart() {
    const last7Days: { date: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const dailySales = await this.saleRepository.find({
            where: { createdAt: Between(date, nextDay) }
        });

        const total = dailySales.reduce((acc, sale) => acc + Number(sale.total), 0);
        last7Days.push({
            date: date.toISOString().split('T')[0],
            total
        });
    }
    return last7Days;
  }
}
