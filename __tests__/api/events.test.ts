import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../vitest.setup';
import { getEvents } from '@/lib/api/events';

describe('Events API', () => {
  it('getEvents handles pagination and passes query parameters correctly', async () => {
    let capturedUrl: URL | undefined;

    server.use(
      http.get('/api/v1/events', ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json({
          content: [{ id: '1', type: 'ACTIVITY' }],
          number: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
          first: true,
          last: true,
        });
      })
    );

    const result = await getEvents({ type: 'ACTIVITY', page: 0, size: 10, search: 'test' });

    expect(capturedUrl?.searchParams.get('type')).toBe('ACTIVITY');
    expect(capturedUrl?.searchParams.get('page')).toBe('0');
    expect(capturedUrl?.searchParams.get('size')).toBe('10');
    expect(capturedUrl?.searchParams.get('search')).toBe('test');

    expect(result.content).toHaveLength(1);
    expect(result.number).toBe(0);
    expect(result.totalElements).toBe(1);
  });
});
