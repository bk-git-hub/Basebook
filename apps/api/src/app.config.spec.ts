import { isAllowedCorsOrigin } from './app.config';

describe('app config', () => {
  it('allows local frontend ports from 3000 to 3010', () => {
    expect(isAllowedCorsOrigin('http://localhost:3000')).toBe(true);
    expect(isAllowedCorsOrigin('http://localhost:3007')).toBe(true);
    expect(isAllowedCorsOrigin('http://localhost:3010')).toBe(true);
    expect(isAllowedCorsOrigin('http://127.0.0.1:3004')).toBe(true);
  });

  it('allows an explicitly configured non-local origin', () => {
    expect(isAllowedCorsOrigin('https://basebook.example.com', 'https://basebook.example.com')).toBe(
      true,
    );
  });

  it('rejects origins outside the local range when not explicitly configured', () => {
    expect(isAllowedCorsOrigin('http://localhost:3011')).toBe(false);
    expect(isAllowedCorsOrigin('https://malicious.example.com')).toBe(false);
  });
});
