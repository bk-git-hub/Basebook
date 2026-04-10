import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

const LOCAL_WEB_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1):(300\d|3010)$/;

export function isAllowedCorsOrigin(origin?: string, configuredOrigin = process.env.WEB_ORIGIN) {
  if (!origin) {
    return true;
  }

  if (LOCAL_WEB_ORIGIN.test(origin)) {
    return true;
  }

  return Boolean(configuredOrigin && origin === configuredOrigin);
}

export function configureApp(app: INestApplication) {
  app.enableCors({
    origin(origin, callback) {
      if (isAllowedCorsOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
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
