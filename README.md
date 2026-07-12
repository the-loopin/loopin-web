# Loopin Chat Page Patch

Replace the matching files in `the-loopin/loopin-web` with the files in this archive:

- `app/(public)/events/[eventId]/groups/[groupId]/chat/page.tsx`
- `lib/api/messages.ts`
- `lib/api/realtimeMessages.ts`

Then run:

```bash
npm install
npm run lint
npm run build
```

The implementation matches the current backend contract:

- REST history: `GET /v1/groups/{groupId}/messages` (Spring Page response)
- SockJS endpoint: `/ws`
- STOMP subscribe: `/topic/groups/{groupId}/messages`
- STOMP publish: `/app/groups/{groupId}/messages`
- Payload: `{ "messageText": "..." }`
