import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Product } from '../product/entities/product.entity';
import { User } from '../user/entities/user.entity';

import { AuditService } from '../audit/audit.service';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  async create(createSaleDto: CreateSaleDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sale = new Sale();
      sale.user = user;
      sale.paymentMethod = createSaleDto.paymentMethod;
      sale.paymentStatus = createSaleDto.paymentStatus ?? 'PAID';
      sale.items = [];
      let total = 0;

      for (const itemDto of createSaleDto.items) {
        const product = await queryRunner.manager.findOne(Product, { 
          where: { id: itemDto.productId }
        });

        if (!product) {
          throw new NotFoundException(`Product ${itemDto.productId} not found`);
        }

        // Logic for Bundles/Combos
        if (product.isBundle) {
          const bundle = await queryRunner.manager.findOne(Product, {
            where: { id: product.id },
            relations: ['bundleItems', 'bundleItems.product']
          });

          if (bundle && bundle.bundleItems) {
            for (const bundleItem of bundle.bundleItems) {
              const childProduct = bundleItem.product;
              if (childProduct.trackStock) {
                  const requiredQty = bundleItem.quantity * itemDto.quantity;
                  if (childProduct.stock < requiredQty) {
                      throw new BadRequestException(`Insufficient stock for component ${childProduct.name} in combo ${product.name}`);
                  }
                  childProduct.stock -= requiredQty;
                  await queryRunner.manager.save(childProduct);
              }
            }
          }
        } 
        // Normal product stock reduction
        else if (product.trackStock) {
          if (product.stock < itemDto.quantity) {
            throw new BadRequestException(`Insufficient stock for product ${product.name}`);
          }

          // Update stock
          product.stock -= itemDto.quantity;
          await queryRunner.manager.save(product);
        }

        const saleItem = new SaleItem();
        saleItem.product = product;
        saleItem.quantity = itemDto.quantity;
        saleItem.priceAtSale = product.price;
        
        total += Number(product.price) * itemDto.quantity;
        sale.items.push(saleItem);
      }

      sale.total = total;
      const savedSale = await queryRunner.manager.save(sale);

      await queryRunner.commitTransaction();
      await this.auditService.log('CREATE', 'SALE', savedSale.id, `Total: ${total}`, user);
      return savedSale;
    } catch (err) {
      console.error('❌ Erro no SaleService:', err);
      await queryRunner.rollbackTransaction();
      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException('Error processing sale: ' + err.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.saleRepository.find({ relations: ['items', 'items.product', 'user'] });
  }

  async findOne(id: number) {
    const sale = await this.saleRepository.findOne({ 
      where: { id }, 
      relations: ['items', 'items.product', 'user'] 
    });
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
    return sale;
  }

  async update(id: number, updateSaleDto: UpdateSaleDto) {
    // Basic status update, more complex logic could be added for cancellations (stock return)
    const sale = await this.findOne(id);
    this.saleRepository.merge(sale, updateSaleDto);
    return await this.saleRepository.save(sale);
  }

  async remove(id: number, user?: User) {
    const sale = await this.findOne(id);
    await this.saleRepository.remove(sale);
    await this.auditService.log('DELETE', 'SALE', id, `Deleted sale worth ${sale.total}`, user);
  }
}
