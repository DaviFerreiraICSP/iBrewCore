import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { AuditService } from '../audit/audit.service';
import { User } from '../user/entities/user.entity';
import { CategoryService } from '../category/category.service';
import { BundleItem } from './entities/bundle-item.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(BundleItem)
    private readonly bundleItemRepository: Repository<BundleItem>,
    private readonly auditService: AuditService,
    private readonly categoryService: CategoryService,
  ) {}

  async create(createProductDto: CreateProductDto, user?: User): Promise<Product> {
    const { categoryId, bundleItems, ...rest } = createProductDto;
    const product = this.productRepository.create(rest);
    
    if (categoryId) {
      product.category = await this.categoryService.findOne(categoryId);
    }
    
    const savedProduct = await this.productRepository.save(product);

    if (bundleItems && bundleItems.length > 0) {
      for (const item of bundleItems) {
        const bundleItem = this.bundleItemRepository.create({
          bundle: savedProduct,
          product: { id: item.productId } as Product,
          quantity: item.quantity,
        });
        await this.bundleItemRepository.save(bundleItem);
      }
    }
    
    await this.auditService.log('CREATE', 'PRODUCT', savedProduct.id, JSON.stringify(createProductDto), user);
    return savedProduct;
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({ relations: ['category'] });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ 
      where: { id },
      relations: ['category']
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto, user?: User): Promise<Product> {
    const { categoryId, ...rest } = updateProductDto;
    const product = await this.findOne(id);
    this.productRepository.merge(product, rest);
    
    if (categoryId) {
      product.category = await this.categoryService.findOne(categoryId);
    }
    
    const savedProduct = await this.productRepository.save(product);
    await this.auditService.log('UPDATE', 'PRODUCT', savedProduct.id, JSON.stringify(updateProductDto), user);
    return savedProduct;
  }

  async remove(id: number, user?: User): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    await this.auditService.log('DELETE', 'PRODUCT', id, `Deleted product: ${product.name}`, user);
  }
}
