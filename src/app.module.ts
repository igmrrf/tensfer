import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllExceptionFilter } from './app/http-exception/http-exception.filter';
import { HttpResponseInterceptor } from './app/http-response/http-response.interceptor';
import config from './config';
import { PrismaService } from './prisma/prisma.service';

// The ConfigModule is a global module that provides configuration variables to the entire application.
@Module({
  // The imports array is used to import other modules whose exported providers are required in this module.
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    HttpModule,
  ],
  // The controllers and providers arrays are used to define the controllers and providers that belong to this module.
  controllers: [AppController],
  // The providers array is used to define the providers that belong to this module.
  providers: [
    AppService,
    PrismaService,
    { provide: APP_INTERCEPTOR, useClass: HttpResponseInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionFilter },
  ],
})
export class AppModule {}
