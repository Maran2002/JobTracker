# Repository guidance

CareerTrack is a JavaScript Next.js App Router application backed by Express and MongoDB. Run it from the repository root. `server.js` serves Next.js SSR and mounts Express API routes on the same port.

## Commands

```bash
npm run dev
npm run build
npm start
npm run lint
```

Configure `PORT`, `MONGO_URI`, `JWT_SECRET`, `API_KEY`, `APP_KEY`, and optional mail/push settings in the single root `.env`. Do not use `NEXT_PUBLIC_*` for secrets.

## Architecture rules

- Use App Router pages/layouts in `app/`. Pages and layouts are Server Components by default.
- Load initial private route data on the server through `app/lib/data.js`; mark user-specific fetches `cache: 'no-store'`.
- Browser interactions must use the Server Action adapter at `src/api/gateway.js` → `app/actions/api.js`. Never call Express `/api/*` endpoints directly from browser code and never expose backend keys.
- Authentication is an HttpOnly `careertrack_session` cookie, validated by the protected server layout. Keep all application and interview database queries scoped to `req.user._id`.
- The Express API is mounted internally by the shared listener in `server.js`; do not start a second production listener.
- Keep the current visual system in `src/index.css`, support widths down to 300px, and omit Pipeline from mobile navigation below 768px.
- Preserve pre-existing user changes in the worktree when editing.
