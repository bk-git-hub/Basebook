import { isAllowedCorsOrigin } from './app.config';

describe('app config', () => {
  it('allows local frontend ports from 3000 to 3010', () => {
    expect(isAllowedCorsOrigin('http://localhost:3000')).toBe(true);
    expect(isAllowedCorsOrigin('http://localhost:3007')).toBe(true);
    expect(isAllowedCorsOrigin('http://localhost:3010')).toBe(true);
    expect(isAllowedCorsOrigin('http://127.0.0.1:3004')).toBe(true);
  });

  it('allows deployed frontend origins without explicit configuration', () => {
    expect(isAllowedCorsOrigin('https://basebook-web.vercel.app')).toBe(true);
    expect(isAllowedCorsOrigin('https://preview-anything.example.com')).toBe(true);
  });

  it('also allows requests that do not include an origin header', () => {
    expect(isAllowedCorsOrigin()).toBe(true);
  });
});
