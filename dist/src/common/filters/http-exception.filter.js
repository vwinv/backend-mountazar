"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Une erreur interne est survenue';
        let error = 'Internal Server Error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
                error = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const responseObj = exceptionResponse;
                if (Array.isArray(responseObj.message)) {
                    if (responseObj.message.length === 1) {
                        message = responseObj.message[0];
                    }
                    else {
                        message = `Plusieurs erreurs de validation : ${responseObj.message.join(', ')}`;
                    }
                }
                else {
                    message = responseObj.message || exception.message || message;
                }
                error = responseObj.error || error;
            }
            else {
                message = exception.message || message;
            }
        }
        else if (exception instanceof Error) {
            const errorName = exception.constructor.name;
            const errorMessage = exception.message || '';
            if (errorName.includes('Prisma') ||
                errorMessage.includes('Prisma') ||
                errorMessage.includes('ConnectorError') ||
                errorMessage.includes('QueryError')) {
                message = this.handlePrismaError(exception);
                status = common_1.HttpStatus.BAD_REQUEST;
            }
            else {
                const isDevelopment = process.env.NODE_ENV !== 'production';
                if (!isDevelopment && status === common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
                    message = 'Une erreur interne est survenue. Veuillez réessayer plus tard.';
                }
                else {
                    message = exception.message || message;
                }
            }
            error = errorName || 'Error';
        }
        this.logger.error(`${request.method} ${request.url} - ${status} - ${message}`, exception instanceof Error ? exception.stack : undefined);
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
    handlePrismaError(exception) {
        const errorMessage = exception.message;
        if (errorMessage.includes('Unique constraint') || errorMessage.includes('Unique constraint failed')) {
            return 'Cette valeur existe déjà. Veuillez en choisir une autre.';
        }
        if (errorMessage.includes('Foreign key constraint') || errorMessage.includes('Foreign key constraint failed')) {
            return 'Impossible de supprimer ou modifier cet élément car il est utilisé ailleurs.';
        }
        if (errorMessage.includes('Unable to fit') || errorMessage.includes('ConversionError')) {
            return 'La valeur fournie est trop grande ou invalide. Veuillez vérifier les données saisies.';
        }
        if (errorMessage.includes('Can\'t reach database') || errorMessage.includes('Connection')) {
            return 'Erreur de connexion à la base de données. Veuillez réessayer plus tard.';
        }
        if (errorMessage.includes('Invalid value') || errorMessage.includes('Argument')) {
            return 'Les données fournies sont invalides. Veuillez vérifier les champs requis.';
        }
        return 'Erreur lors de l\'opération sur la base de données. Veuillez vérifier vos données.';
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=http-exception.filter.js.map