import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/exception.filter';
import * as cors from 'cors';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer logs before NestJS is fully initialized
  });

  app.useLogger(app.get(Logger)); // Use Pino as the logger

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Enable CORS
  const allowedOrigins = [
    'http://127.0.0.1',
    'http://localhost',
    'http://44.209.6.220',
  ];

  app.use(
    cors({
      optionsSuccessStatus: 200,
      credentials: true,
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Voucher and Promotion API')
    .setDescription('API documentation for voucher and promotion management')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
