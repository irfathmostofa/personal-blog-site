# Phase 5 — Admin authentication

Status: **complete**. `/admin` authenticates through Supabase Auth. Every protected newsroom route and mutation re-reads the session and `profiles.role` on the server. Ordinary authenticated users cannot enter.

## Delivered

### Login (`/admin`)

- Editorial split-screen sign-in: email and password, Zod-validated Server Action.
- `signInWithPassword` via the cookie session client in `src/lib/supabase/server.ts`.
- After a successful Auth response the action loads `profiles.role`. If the row is missing or not `admin` / `editor`, the session is signed out and the form returns a generic unauthorized message.
- Authorized staff redirect to `/admin/dashboard`, or to a same-origin `/admin/...` path supplied as `next`.
- Already-signed-in staff who visit `/admin` are sent onward. Unauthenticated visitors see the form.
- No public registration. Credentials are never hardcoded.

### Server-side authorization

`src/lib/auth`:

- `getStaffSession` — request-deduped (`react.cache`). Calls `connection()`, then `auth.getUser()` and a `profiles` select. Returns `null` when unconfigured, unsigned-in, or not staff.
- `requireStaff` / `requireAdmin` — redirect to `/admin` (or `/admin/dashboard` for non-admins) when the check fails.
- `safeAdminNext` — only in-app `/admin/` paths are accepted as post-login destinations.

Session and role checks live in admin routes and Server Actions. Cached public helpers in `src/lib/queries` still must not read cookies.

### Protected shell

- Route group `src/app/admin/(panel)` wraps every newsroom page. The layout calls `requireStaff` behind `<Suspense>`.
- `/admin/dashboard` is a protected newsroom route. Phase 6 replaced the profile confirmation card with live statistics and a sidebar.
- `signOut` is a Server Action: `auth.signOut()` then redirect to `/admin`.
- Admin metadata is `noIndex`. The proxy sets `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, nofollow` on `/admin`.

### Security posture

- Frontend hiding is not treated as protection. `requireStaff` runs on the server for the panel layout and again inside the dashboard page.
- Mutations that arrive in later phases must call `requireStaff` / `requireAdmin` before writing, then the cache helpers from Phase 4.
- Service-role key stays in `src/lib/supabase/admin.ts` (`server-only`). Login uses the anon key plus RLS.
- Supabase Auth rate-limits password attempts; this phase does not add a second limiter.
- Administrators are provisioned in the dashboard, then promoted with the SQL in `docs/SUPABASE.md`. Signup remains disabled.

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Without credentials, `/admin` still renders and the action explains that Auth is disconnected. With credentials:

1. An unauthenticated visit to `/admin/dashboard` redirects to `/admin`.
2. A valid staff login lands on `/admin/dashboard` and shows that profile.
3. A valid Auth user whose `profiles.role` is missing or not staff is signed out and refused.
4. Sign out clears the cookie session and returns to `/admin`.

## What Phase 6 depends on

- `requireStaff()` in every newsroom layout and `requireStaff` / `requireAdmin` in every admin Server Action.
- `StaffSession.profile` for the chrome (name, role, initials).
- Do not publicly cache anything under `/admin`.
- Dashboard statistics, sidebar and charts are still to be built; do not invent numbers.

## Deliberate omissions

- No sidebar, charts or content CRUD — Phase 6+.
- No password reset or invite UI — provisioning stays in `docs/SUPABASE.md`.
- No client-only route guards. The login form is the only client island on `/admin`.
