# OpenAPI Contract Snapshot

`contracts/openapi.json` is the committed frontend snapshot of the Loopin backend OpenAPI contract.

The snapshot is the source used by `openapi-typescript` to generate:

```text

lib/api/generated/schema.ts
Neither generated file should be edited manually.
Source endpoint
The default source is:

http://localhost:8080/api/v3/api-docs
A different source can be supplied through:

OPENAPI_SCHEMA_URL
Important: use a clean backend instance
Before updating the snapshot:
1.	Stop old backend Java processes.
2.	Stop old Docker containers that may expose the same port.
3.	Check out the intended backend commit.
4.	Run a clean backend build.
5.	Start that clean backend instance.
6.	Confirm that /api/v3/api-docs comes from the intended process.
A newly merged backend commit does not guarantee that the currently running local server contains the new code.
Update commands
PowerShell

$env:OPENAPI_SCHEMA_URL = "http://localhost:8080/api/v3/api-docs"
npm run api:schema:update
npm run api:generate
npm run api:check
npm test -- __tests__/contracts/openapi-contract.test.ts
Bash

OPENAPI_SCHEMA_URL=http://localhost:8080/api/v3/api-docs \
  npm run api:schema:update

npm run api:generate
npm run api:check
npm test -- __tests__/contracts/openapi-contract.test.ts
Required media contract
The schema update command intentionally fails unless the backend specification contains all of the following:
Events

EventCreateRequest.imageMediaId
EventUpdateRequest.imageMediaId
EventResponse.image
Groups

CreateGroupRequest.imageMediaId
GroupResponse.image
Profiles

UserProfileResponse.avatar
UpdateUserAvatarRequest
PUT /v1/me/avatar
DELETE /v1/me/avatar
Shared media response

MediaReferenceResponse
This validation prevents a stale backend process from overwriting the repository snapshot with an outdated contract.
CI behavior
npm run api:check verifies that:
1.	lib/api/generated/schema.ts can be regenerated from contracts/openapi.json.
2.	The generated file has no uncommitted differences.
The contract test additionally verifies that the committed snapshot contains the required Event, Group, Profile, and Media capabilities.
CI does not fetch a running backend. Refreshing the committed snapshot remains an explicit development operation.
