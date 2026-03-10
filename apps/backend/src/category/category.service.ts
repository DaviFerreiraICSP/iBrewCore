import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { AuditService } from '../audit/audit.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly auditService: AuditService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, user?: User) {
    const category = this.categoryRepository.create(createCategoryDto);
    const saved = await this.categoryRepository.save(category);
    await this.auditService.log('CREATE', 'CATEGORY', saved.id, JSON.stringify(createCategoryDto), user);
    return saved;
  }

  async findAll() {
    return await this.categoryRepository.find({ relations: ['products'] });
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({ 
      where: { id },
      relations: ['products']
    });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto, user?: User) {
    const category = await this.findOne(id);
    this.categoryRepository.merge(category, updateCategoryDto);
    const saved = await this.categoryRepository.save(category);
    await this.auditService.log('UPDATE', 'CATEGORY', saved.id, JSON.stringify(updateCategoryDto), user);
    return saved;
  }

  async remove(id: number, user?: User) {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    await this.auditService.log('DELETE', 'CATEGORY', id, `Deleted category: ${category.name}`, user);
  }
}
