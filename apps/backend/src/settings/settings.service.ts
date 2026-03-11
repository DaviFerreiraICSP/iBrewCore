import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
  ) {}

  async onModuleInit() {
    // Initialize default settings if they don't exist
    const defaults = [
      { key: 'audio_enabled', value: 'true' },
      { key: 'audio_volume', value: '50' },
      { key: 'bank_info', value: JSON.stringify({ name: '', agency: '', account: '', pix: '' }) },
      { key: 'card_rates', value: JSON.stringify({ debit: 0, credit: 0, brands: ['Visa', 'Mastercard'] }) },
      { key: 'language', value: '"pt"' }
    ];

    for (const item of defaults) {
      const exists = await this.settingsRepository.findOne({ where: { key: item.key } });
      if (!exists) {
        await this.settingsRepository.save(this.settingsRepository.create(item));
      }
    }
  }

  async findAll() {
    const settings = await this.settingsRepository.find();
    return settings.reduce((acc, curr) => {
      try {
        acc[curr.key] = JSON.parse(curr.value);
      } catch {
        acc[curr.key] = curr.value;
      }
      return acc;
    }, {});
  }

  async update(settings: Record<string, any>) {
    const entries = Object.entries(settings).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
    }));

    for (const entry of entries) {
      await this.settingsRepository.upsert(entry, ['key']);
    }
    
    return this.findAll();
  }
}
