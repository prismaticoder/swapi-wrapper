import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { SwapiException } from '../exceptions/swapi.exception';
import { ResourceNotFound } from '../exceptions/resource-not-found.exception';

@Catch(SwapiException)
export class SwapiExceptionFilter implements ExceptionFilter {
  catch(exception: SwapiException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof ResourceNotFound
        ? HttpStatus.NOT_FOUND
        : HttpStatus.SERVICE_UNAVAILABLE;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
