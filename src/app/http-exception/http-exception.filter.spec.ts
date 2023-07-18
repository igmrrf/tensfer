import { AbstractHttpAdapter } from '@nestjs/core';
import { AllExceptionFilter as HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
    it('should be defined', () => {
        expect(new HttpExceptionFilter(AbstractHttpAdapter)).toBeDefined();
    });
});
