import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../vitest.setup';
import apiClient from '@/lib/api/client';
import { ApiException } from '@/lib/api/errors';

describe('API Client Interceptor', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, pathname: '/dashboard', assign: vi.fn() },
      writable: true,
    });
  });

  it('maps 404 to NOT_FOUND instead of INTERNAL_SERVER_ERROR', async () => {
    server.use(
      http.get('/api/v1/test-404', () => {
        return HttpResponse.json(null, { status: 404 });
      })
    );

    try {
      await apiClient.get('/test-404');
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).code).toBe('NOT_FOUND');
      expect((error as ApiException).status).toBe(404);
    }
  });

  it('rejects absolute API URLs before a request is sent', async () => {
    await expect(
      apiClient.get('https://evil.example/collect')
    ).rejects.toMatchObject({
      code: 'INVALID_API_URL',
      status: 400,
    });
  });

  it('triggers redirect for protected endpoints on 401', async () => {
    server.use(
      http.get('/api/v1/some-protected-route', () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      })
    );

    try {
      await apiClient.get('/some-protected-route');
    } catch (error) {
      expect((error as ApiException).status).toBe(401);
    }

    expect(window.location.assign).toHaveBeenCalledWith('/login');
  });
});
