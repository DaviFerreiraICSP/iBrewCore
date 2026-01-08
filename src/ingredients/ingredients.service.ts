import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { PrismaClient } from '@prisma/client/extension';
import { Ingredient } from './entities/ingredient.entity';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async addStock(IngredientId: string, amount: number) {
    return this.prisma.ingredient.update({
      where: { id: IngredientId },
      data: {
        stockQTY: {
          increment: amount
        }
      }
    })
  }

  async removeStock(IngredientId: string, amount: number) {
    const checkStock = await this.prisma.ingredient.findUnique({
      where: { id: IngredientId }
    });

    if (checkStock.stockQTY < amount || checkStock.stockQTY === 0) {
      throw new Error('Insufficient stock quantity');
    }

    return this.prisma.ingredient.update({
      where: { id: IngredientId },
      data: {
        stockQTY: {
          decrement: amount
        }
      }
    })
  }

  async createIngredient(data: CreateIngredientDto) {
    const alreadyExists = await this.prisma.ingredient.findUnique({
      where: { name: data.name}
    })

    if (alreadyExists) {
      throw new Error('Ingredient Already Exists')
    }

    return this.prisma.ingredient.create({
      data: {
        name: data.name,
        unit: data.unit,
        description: data.description,
        stockQTY: data.stockQTY,
      }
    })
  }

}