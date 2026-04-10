import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.config';
import { PrismaSeedService } from './../src/prisma/prisma-seed.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prismaSeedService: PrismaSeedService;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    await app.listen(0);
    const address = app.getHttpServer().address();

    if (!address || typeof address === 'string') {
      throw new Error('Failed to resolve test server address');
    }

    baseUrl = `http://127.0.0.1:${address.port}`;
    prismaSeedService = app.get(PrismaSeedService);
  });

  beforeEach(async () => {
    await prismaSeedService.resetDemoEntries();
  });

  it('/health (GET)', () => {
    return request(baseUrl)
      .get('/health')
      .expect(200)
      .expect({
        ok: true,
        service: 'basebook-api',
      });
  });

  it('/games (GET) returns filtered game candidates', () => {
    return request(baseUrl)
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
    return request(baseUrl).get('/games').expect(400);
  });

  it('/entries (GET) returns seeded entries and summary', () => {
    return request(baseUrl)
      .get('/entries')
      .expect(200)
      .expect(({ body }) => {
        expect(body.entries).toHaveLength(3);
        expect(body.summary).toEqual({
          totalGames: 3,
          wins: 2,
          losses: 0,
          draws: 1,
        });
      });
  });

  it('/entries/:id (GET) returns a single entry', () => {
    return request(baseUrl)
      .get('/entries/entry-lg-2025-09-18')
      .expect(200)
      .expect(({ body }) => {
        expect(body.entry.id).toBe('entry-lg-2025-09-18');
        expect(body.entry.photos).toHaveLength(1);
      });
  });

  it('/entries (POST) creates a new diary entry for the demo owner', () => {
    return request(baseUrl)
      .post('/entries')
      .send({
        seasonYear: 2026,
        date: '2026-04-11',
        favoriteTeam: 'LG',
        opponentTeam: 'SSG',
        scoreFor: 7,
        scoreAgainst: 4,
        result: 'WIN',
        watchType: 'STADIUM',
        stadium: 'Jamsil Baseball Stadium',
        highlight: '연장 승부 끝에 이겨서 귀가길까지 기분이 좋았다.',
        rawMemo: '응원석 분위기가 최고였다.',
        photos: [
          {
            id: 'photo-created-1',
            url: 'https://placehold.co/1200x900/png?text=Created+Entry',
            fileName: 'created-entry.png',
          },
        ],
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.entry.ownerId).toBe('demo-user-001');
        expect(body.entry.favoriteTeam).toBe('LG');
        expect(body.entry.photos).toHaveLength(1);
      });
  });

  it('/entries/:id (PATCH) updates an existing entry', () => {
    return request(baseUrl)
      .patch('/entries/entry-lg-2026-03-22')
      .send({
        highlight: '집관이었지만 끝내기 장면 때문에 소리 질렀다.',
        photos: [
          {
            id: 'photo-updated-1',
            url: 'https://placehold.co/1200x900/png?text=Updated+Entry',
            fileName: 'updated-entry.png',
          },
        ],
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.entry.highlight).toContain('끝내기');
        expect(body.entry.photos).toEqual([
          expect.objectContaining({
            id: 'photo-updated-1',
          }),
        ]);
      });
  });

  it('/uploads/image (POST) stores a local image asset and exposes a retrievable URL', async () => {
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn0X3sAAAAASUVORK5CYII=',
      'base64',
    );

    const uploadResponse = await request(baseUrl)
      .post('/uploads/image')
      .attach('file', pngBuffer, {
        filename: 'entry-photo.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect(uploadResponse.body.asset.id).toBeTruthy();
    expect(uploadResponse.body.asset.fileName).toMatch(/\.png$/);
    expect(uploadResponse.body.asset.url).toContain('/uploads/local/');

    const assetUrl = new URL(uploadResponse.body.asset.url);

    await request(baseUrl)
      .get(assetUrl.pathname)
      .expect(200)
      .expect('Content-Type', /image\/png/);
  });

  afterAll(async () => {
    await app.close();
  });
});
