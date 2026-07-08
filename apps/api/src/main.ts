import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  // Body parser limit (기본 100KB → 50MB)
  const express = require('express');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Cookie parser (for httpOnly refresh token)
  app.use(cookieParser());

  // CORS for client (4200) and admin (4300)
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:4300'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 API server running on: http://localhost:${port}`);
}

bootstrap();
