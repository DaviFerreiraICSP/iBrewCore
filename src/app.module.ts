import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [OrdersModule, IngredientsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
