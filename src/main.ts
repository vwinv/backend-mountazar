import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import 'dotenv/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configuration CORS pour permettre les requêtes depuis le frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Augmenter la limite de taille du body JSON (50MB)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  // Augmenter la limite pour les multipart/form-data (uploads de fichiers)
  app.use(express.raw({ limit: '50mb' }));
  app.use(express.text({ limit: '50mb' }));

  // Servir les fichiers statiques (uploads)
  app.useStaticAssets(join(process.cwd(), 'public'));

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        // Formater les erreurs de validation pour retourner des messages clairs
        const formattedErrors = errors.map((error) => {
          const constraints = error.constraints;
          if (constraints) {
            return Object.values(constraints)[0];
          }
          return `${error.property} a une valeur invalide`;
        });
        
        // Retourner une BadRequestException avec les messages formatés
        return new BadRequestException({
          message: formattedErrors.length === 1 
            ? formattedErrors[0] 
            : 'Plusieurs erreurs de validation',
          errors: formattedErrors,
        });
      },
    }),
  );

  // Filtre d'exception global pour gérer toutes les erreurs
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
