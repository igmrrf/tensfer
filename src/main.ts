import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Instantiating the Nest application
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enabling CORS to allow connections from all origins
  app.enableCors({ origin: '*' });
  // Starting the application on port 3000
  await app.listen(3000);
}
bootstrap();
