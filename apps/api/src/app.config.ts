import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

export function isAllowedCorsOrigin() {
  return true;
}

export function configureApp(app: INestApplication) {
  app.enableCors({
    origin: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
}
