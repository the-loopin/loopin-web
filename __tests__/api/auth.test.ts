import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../vitest.setup';
import { devLogin } from '@/lib/api/auth';
import { googleLogin } from '@/lib/api/auth';

describe('Auth API', () => {
  it('devLogin sends exact payload and maps response correctly', async () => {
    let capturedRequest: unknown;
    server.use(
      http.post('/api/v1/auth/dev-login', async ({ request }) => {
        capturedRequest = await request.json();
        return HttpResponse.json({
          token: 'fake-jwt-token',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        });
      })
    );

    const result = await devLogin({ email: 'test@example.com' });

    expect(capturedRequest).toEqual({ email: 'test@example.com' });
    expect(result).toEqual({
      token: 'fake-jwt-token',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    });
  });

  it('googleLogin sends GoogleLoginRequest and maps response correctly', async () => {
    let capturedRequest: unknown;
    server.use(
      http.post('/api/v1/auth/google', async ({ request }) => {
        capturedRequest = await request.json();
        return HttpResponse.json({
          token: 'google-jwt-token',
          email: 'google@example.com',
          name: 'Google User',
          role: 'USER',
        });
      })
    );

    const result = await googleLogin('fake-credential-token');

    expect(capturedRequest).toEqual({ idToken: 'fake-credential-token' });
    expect(result).toEqual({
      token: 'google-jwt-token',
      email: 'google@example.com',
      name: 'Google User',
      role: 'USER',
    });
  });
});
