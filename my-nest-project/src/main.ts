import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'], // <== Добавь OPTIONS!
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(json({ limit: '10mb' })); // увеличить лимит для JSON
  app.use(urlencoded({ limit: '10mb', extended: true })); // увеличить лимит для формы
  await app.listen(3001);
}
bootstrap();
