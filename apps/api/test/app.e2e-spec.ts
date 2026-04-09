import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({
        ok: true,
        service: 'basebook-api',
      });
  });

  it('/games (GET) returns filtered game candidates', () => {
    return request(app.getHttpServer())
      .get('/games')
      .query({
        favoriteTeam: 'LG',
        seasonYear: '2026',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.games).toHaveLength(3);
        expect(body.games.map((game: { status: string }) => game.status)).toEqual([
          'FINAL',
          'IN_PROGRESS',
          'SCHEDULED',
        ]);
      });
  });

  it('/games (GET) rejects requests without favoriteTeam', () => {
    return request(app.getHttpServer()).get('/games').expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
