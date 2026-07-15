import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../vitest.setup';
import { devLogin, googleLogin } from '@/lib/api/auth';

const SESSION_PLACEHOLDER = 'http-only-session';

describe('Auth API', () => {
  it('devLogin uses the frontend session endpoint without exposing the JWT', async () => {
    let capturedRequest: unknown;
    let requestedWith: string | null = null;

    server.use(
      http.post('/api/auth/dev', async ({ request }) => {
        capturedRequest = await request.json();
        requestedWith = request.headers.get('x-requested-with');
        return HttpResponse.json({
          authenticated: true,
          role: 'USER',
        });
      })
    );

    const result = await devLogin({ email: 'test@example.com' });

    expect(capturedRequest).toEqual({ email: 'test@example.com' });
    expect(requestedWith).toBe('XMLHttpRequest');
    expect(result).toEqual({
      token: SESSION_PLACEHOLDER,
      role: 'USER',
    });
  });

  it('googleLogin sends the ID token only to the same-origin session endpoint', async () => {
    let capturedRequest: unknown;
    let requestedWith: string | null = null;

    server.use(
      http.post('/api/auth/google', async ({ request }) => {
        capturedRequest = await request.json();
        requestedWith = request.headers.get('x-requested-with');
        return HttpResponse.json({
          authenticated: true,
          role: 'USER',
        });
      })
    );

    const result = await googleLogin('fake-credential-token');

    expect(capturedRequest).toEqual({ idToken: 'fake-credential-token' });
    expect(requestedWith).toBe('XMLHttpRequest');
    expect(result).toEqual({
      token: SESSION_PLACEHOLDER,
      role: 'USER',
    });
  });
});
