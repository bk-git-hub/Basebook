import { HealthController } from './health.controller';

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(() => {
    healthController = new HealthController();
  });

  it('returns the contract-aligned health payload', () => {
    expect(healthController.getHealth()).toEqual({
      ok: true,
      service: 'basebook-api',
    });
  });
});
