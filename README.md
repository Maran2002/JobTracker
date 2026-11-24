# ApplyLog — CareerTrack

ApplyLog is a responsive job application tracker built with Next.js App Router, React, Express, and MongoDB. Next.js renders pages on the server. The Next and Express handlers share one HTTP listener and port; browser-origin requests to `/api/*` are rejected.

## Run locally

1. Create one `.env` file in the repository root with `PORT`, `MONGO_URI`, `JWT_SECRET`, `API_KEY`, `APP_KEY`, and any mail or push notification settings used by the backend.
2. From the repository root run `npm install` and `npm run dev`.
3. Open `http://localhost:3000` (or the port set by `PORT`).

Production uses `npm run build` followed by `npm start`. Run the app from the repository root; the backend package is an internal data service and is not started separately.

## Architecture

- `app/` — Next.js App Router layouts, routes, SSR data loaders, and Server Actions.
- `server.js` — one HTTP listener that dispatches `/api/*` internally to Express and all other requests to Next.js.
- `backend/` — Express routes, MongoDB models, middleware, and utilities mounted on the shared listener.
- `src/` — existing React screens, shared UI, styles, client state, and small navigation compatibility helpers.
- `public/` — static assets and the web push service worker.

Protected pages validate the HttpOnly `careertrack_session` cookie on the server. Server Components load private page data with `cache: 'no-store'`; interactive mutations and searches call a constrained Next Server Action that forwards requests internally. Backend keys and bearer tokens are not exposed to browser JavaScript. API keys are server environment variables, never `NEXT_PUBLIC_*` variables.

## Routes

`/login`, `/register`, `/dashboard`, `/applications`, `/applications/new`, `/applications/edit/[id]`, `/applications/[id]`, `/pipeline`, `/schedule`, `/analytics`, `/settings`, and `/admin`.

The application keeps the existing design system, theme preferences, interview scheduling, analytics, notifications, and responsive layout. The pipeline remains omitted from the mobile sidebar.
