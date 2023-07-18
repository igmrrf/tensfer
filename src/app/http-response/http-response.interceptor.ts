import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, map } from 'rxjs';

export interface CustomResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
  links?: string[];
}

@Injectable()
export class HttpResponseInterceptor<T>
  implements NestInterceptor<T, CustomResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<CustomResponse<T>> {
    const start = Date.now();
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status_code = response.statusCode;
        return {
          success: true,
          status_code,
          message: data?.message || 'Success',
          data: data?.data || data,
          timestamp: new Date().toISOString(),
          links: [],
          rate: Date.now() - start,
          path: request.url,
        };
      }),
    );
  }
}
