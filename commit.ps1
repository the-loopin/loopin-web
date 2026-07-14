# Commit files one by one with appropriate tags
git add lib/api/contracts.ts
git commit -m "fix(api): align contracts with OpenAPI schema"

git add lib/api/auth.ts
git commit -m "fix(api): correct devLogin endpoint and idToken for googleLogin"

git add lib/api/client.ts
git commit -m "fix(api): normalize API errors with backend status codes"

git add lib/api/groups.ts
git commit -m "refactor(api): remove unsupported group endpoints"

git add lib/api/profiles.ts
git commit -m "refactor(api): remove unsupported avatar endpoints"

git add lib/api/admin.ts
git commit -m "refactor(api): remove unsupported admin group endpoint"

git add app/(public)/events/[eventId]/groups/page.tsx
git commit -m "fix(ui): isolate group listing and show unavailable state"

git add app/(public)/profile/page.tsx
git commit -m "fix(ui): remove manual avatar logic and online status"

git add app/(public)/activities/page.tsx
git commit -m "fix(ui): correct getEvents params and handle pagination"

git add app/(public)/events/page.tsx
git commit -m "fix(ui): correct getEvents params and use pageData"

git add app/(admin)/admin/events/page.tsx
git commit -m "fix(lint): avoid setState within effect"

git add app/(admin)/admin/users/page.tsx
git commit -m "fix(lint): fix any and avoid setState within effect"

git add components/profile/badges/BadgeSummary.tsx
git commit -m "fix(lint): escape quotes in BadgeSummary"

git add components/three/MatchArcs.tsx
git commit -m "fix(lint): remove any from three child types"

git add hooks/useGroups.ts
git commit -m "refactor(hooks): remove getGroupsByEvent from useGroups"

git add package.json package-lock.json vitest.config.ts vitest.setup.ts __tests__/
git commit -m "test: setup vitest with msw for api endpoints"

git add .github/
git commit -m "ci: add github action for contract verification"

# Finally, push the changes
git push
