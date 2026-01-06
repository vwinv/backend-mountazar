import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Une erreur interne est survenue';
    let error: string | object = 'Internal Server Error';

    // Si c'est une HttpException de NestJS, extraire le message
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        
        // Si le message est un tableau (erreurs de validation), formater le message
        if (Array.isArray(responseObj.message)) {
          if (responseObj.message.length === 1) {
            message = responseObj.message[0];
          } else {
            message = `Plusieurs erreurs de validation : ${responseObj.message.join(', ')}`;
          }
        } else {
          message = responseObj.message || exception.message || message;
        }
        
        error = responseObj.error || error;
      } else {
        message = exception.message || message;
      }
    } else if (exception instanceof Error) {
      // Gérer les erreurs Prisma
      const errorName = exception.constructor.name;
      const errorMessage = exception.message || '';
      
      // Détecter les erreurs Prisma par leur nom de classe ou leur message
      if (
        errorName.includes('Prisma') ||
        errorMessage.includes('Prisma') ||
        errorMessage.includes('ConnectorError') ||
        errorMessage.includes('QueryError')
      ) {
        message = this.handlePrismaError(exception);
        status = HttpStatus.BAD_REQUEST;
      } else {
        // Pour les autres erreurs, utiliser le message de l'erreur
        // En production, ne pas exposer les détails techniques
        const isDevelopment = process.env.NODE_ENV !== 'production';
        if (!isDevelopment && status === HttpStatus.INTERNAL_SERVER_ERROR) {
          message = 'Une erreur interne est survenue. Veuillez réessayer plus tard.';
        } else {
          message = exception.message || message;
        }
      }
      
      error = errorName || 'Error';
    }

    // Logger l'erreur pour le débogage
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // En production, ne pas exposer les détails des erreurs internes
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    response.status(status).json({
      statusCode: status,
      message: message,
      error: error,
      ...(isDevelopment && exception instanceof Error && {
        stack: exception.stack,
        details: exception.message,
      }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private handlePrismaError(exception: Error): string {
    const errorMessage = exception.message;

    // Erreur de contrainte unique
    if (errorMessage.includes('Unique constraint') || errorMessage.includes('Unique constraint failed')) {
      return 'Cette valeur existe déjà. Veuillez en choisir une autre.';
    }

    // Erreur de clé étrangère
    if (errorMessage.includes('Foreign key constraint') || errorMessage.includes('Foreign key constraint failed')) {
      return 'Impossible de supprimer ou modifier cet élément car il est utilisé ailleurs.';
    }

    // Erreur de conversion de type
    if (errorMessage.includes('Unable to fit') || errorMessage.includes('ConversionError')) {
      return 'La valeur fournie est trop grande ou invalide. Veuillez vérifier les données saisies.';
    }

    // Erreur de connexion à la base de données
    if (errorMessage.includes('Can\'t reach database') || errorMessage.includes('Connection')) {
      return 'Erreur de connexion à la base de données. Veuillez réessayer plus tard.';
    }

    // Erreur de validation Prisma
    if (errorMessage.includes('Invalid value') || errorMessage.includes('Argument')) {
      return 'Les données fournies sont invalides. Veuillez vérifier les champs requis.';
    }

    // Message générique pour les erreurs Prisma
    return 'Erreur lors de l\'opération sur la base de données. Veuillez vérifier vos données.';
  }
}

