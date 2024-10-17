import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    this.logger.error('Exception: ', exception);
    this.logger.error('Stack: ', exception.stack);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An error occurred';

    if (exception instanceof HttpException) {
      // Handle generic HttpExceptions
      this.logger.log('Error: ', exception.getResponse());
      const response: any = exception.getResponse();
      statusCode = exception.getStatus();
      errorCode = exception.name;
      message =
        typeof response === 'object' ? response.message : exception.message;
    } else if (exception instanceof QueryFailedError) {
      // Handle TypeORM/PostgreSQL errors
      const errorDetail = exception.driverError.detail;
      if (exception.driverError.code === '23505') {
        // Unique violation (duplicate key error)
        statusCode = HttpStatus.BAD_REQUEST;
        errorCode = 'ERR_DUPLICATE_KEY';
        message = `Duplicate key error: ${getDuplicateKeyField(exception)}`;
      } else if (exception.driverError.code === '23503') {
        // Foreign key violation
        statusCode = HttpStatus.BAD_REQUEST;
        errorCode = 'ERR_FOREIGN_KEY_CONSTRAINT';
        message = `Foreign key constraint violation: ${errorDetail}`;
      } else if (exception.driverError.code === '22P02') {
        // Invalid input syntax (e.g., invalid UUID)
        statusCode = HttpStatus.BAD_REQUEST;
        errorCode = 'ERR_INVALID_INPUT_SYNTAX';
        message = 'Invalid input syntax for the field';
      } else {
        // Handle other SQL errors
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        errorCode = 'ERR_SQL_ERROR';
        message = exception.message || 'Database error occurred';
      }
    } else {
      // Handle other unexpected errors
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = 'INTERNAL_SERVER_ERROR';
      message = exception.message || 'Internal Server Error';
    }

    response.status(statusCode).json({
      statusCode,
      errorCode,
      message,
    });
  }
}

// Helper function to extract duplicate key error field for PostgreSQL
const getDuplicateKeyField = (exception: QueryFailedError): string => {
  const errorDetail = exception.driverError.message || '';
  const match = errorDetail.match(/Key \((.+?)\)=/);
  if (match && match[1]) {
    return match[1];
  }
  return 'Unknown field';
};
