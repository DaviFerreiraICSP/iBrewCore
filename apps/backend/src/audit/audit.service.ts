import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async log(action: string, module: string, entityId?: number, details?: string, user?: User) {
    const auditLog = this.auditRepository.create({
      action,
      module,
      entityId,
      details,
      user,
    });
    return await this.auditRepository.save(auditLog);
  }

  async findAll() {
    return await this.auditRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
