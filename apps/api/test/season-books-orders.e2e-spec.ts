import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.config';
import { PrismaSeedService } from './../src/prisma/prisma-seed.service';

describe('SeasonBookOrdersController (e2e)', () => {
  let app: INestApplication<App>;
  let prismaSeedService: PrismaSeedService;
  let baseUrl: string;
  const originalUploadStorageDriver = process.env.UPLOAD_STORAGE_DRIVER;

  beforeAll(async () => {
    process.env.UPLOAD_STORAGE_DRIVER = 'local';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    await app.listen(0, '127.0.0.1');
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

  it('/season-books/orders (GET) returns latest-first order history and excludes estimate-only projects', async () => {
    const firstEstimateResponse = await request(baseUrl)
      .post('/season-books/estimate')
      .send({
        seasonYear: 2026,
        title: '첫 번째 두산 시즌북',
        coverPhotoUrl: 'http://localhost:4000/uploads/local/cover-photo.png',
        selectedEntryIds: ['entry-doosan-2026-03-22'],
      })
      .expect(201);

    const firstOrderResponse = await request(baseUrl)
      .post('/season-books/order')
      .send({
        projectId: firstEstimateResponse.body.projectId,
        recipientName: '홍길동',
        recipientPhone: '010-1234-5678',
        postalCode: '06236',
        address1: '서울특별시 강남구 테헤란로 123',
      })
      .expect(201);

    const secondEstimateResponse = await request(baseUrl)
      .post('/season-books/estimate')
      .send({
        seasonYear: 2026,
        title: '두 번째 두산 시즌북',
        coverPhotoUrl: 'http://localhost:4000/uploads/local/cover-photo.png',
        selectedEntryIds: ['entry-doosan-2026-04-02'],
      })
      .expect(201);

    const secondOrderResponse = await request(baseUrl)
      .post('/season-books/order')
      .send({
        projectId: secondEstimateResponse.body.projectId,
        recipientName: '김철수',
        recipientPhone: '010-9999-0000',
        postalCode: '04524',
        address1: '서울특별시 중구 세종대로 110',
      })
      .expect(201);

    await request(baseUrl)
      .post('/season-books/estimate')
      .send({
        seasonYear: 2026,
        title: '견적만 만든 시즌북',
        coverPhotoUrl: 'http://localhost:4000/uploads/local/cover-photo.png',
        selectedEntryIds: ['entry-doosan-2025-09-18'],
      })
      .expect(201);

    await request(baseUrl)
      .post(`/season-books/${firstEstimateResponse.body.projectId}/cancel`)
      .send({
        cancelReason: '테스트 취소',
      })
      .expect(201);

    await request(baseUrl)
      .get('/season-books/orders')
      .expect(200)
      .expect(({ body }) => {
        expect(body.orders).toHaveLength(2);
        expect(body.orders).toEqual([
          expect.objectContaining({
            projectId: firstEstimateResponse.body.projectId,
            title: '첫 번째 두산 시즌북',
            orderUid: firstOrderResponse.body.orderUid,
            projectStatus: 'ORDERED',
            orderStatus: 'CANCELLED_REFUND',
            totalPrice: firstOrderResponse.body.totalPrice,
            currency: 'KRW',
          }),
          expect.objectContaining({
            projectId: secondEstimateResponse.body.projectId,
            title: '두 번째 두산 시즌북',
            orderUid: secondOrderResponse.body.orderUid,
            projectStatus: 'ORDERED',
            orderStatus: 'CONFIRMED',
            totalPrice: secondOrderResponse.body.totalPrice,
            currency: 'KRW',
          }),
        ]);
        expect(
          body.orders.some(
            (order: { projectId: string }) =>
              order.projectId === secondEstimateResponse.body.projectId,
          ),
        ).toBe(true);
        expect(
          body.orders.some(
            (order: { projectId: string }) =>
              order.projectId === firstEstimateResponse.body.projectId,
          ),
        ).toBe(true);
        expect(
          body.orders.every(
            (order: { title: string }) => order.title !== '견적만 만든 시즌북',
          ),
        ).toBe(true);
        expect(
          body.orders.every(
            (order: { createdAt?: string; updatedAt?: string }) =>
              Boolean(order.createdAt && order.updatedAt),
          ),
        ).toBe(true);
      });
  });

  afterAll(async () => {
    await app.close();

    if (originalUploadStorageDriver === undefined) {
      delete process.env.UPLOAD_STORAGE_DRIVER;
      return;
    }

    process.env.UPLOAD_STORAGE_DRIVER = originalUploadStorageDriver;
  });
});
