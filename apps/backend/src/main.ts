import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  
  // Ensure the uploads directory is served correctly relative to the project root
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  
  const configService = app.get(ConfigService);
  
  app.enableCors(); // In production, refine this
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
