# DemonZ Development

Public website for DemonZ Development — open source projects, articles, and
AI research, deployed at <https://demonzdevelopment.online>.

## Repository layout

```
.
├── backend/        # Hono API on Cloudflare Workers (TypeScript)
├── frontend/       # Public React 19 + Vite site (TypeScript)
└── admin-frontend/ # Admin React 19 + Vite dashboard (TypeScript)
```

## Quick start

```sh
# Backend
cd backend
npm install
npm run dev          # wrangler dev (Workers runtime locally)
npm test             # vitest
npm run typecheck    # tsc --noEmit

# Frontend
cd ../frontend
npm install
npm run dev          # Vite dev server with /api proxy
npm test
npm run lint
npm run build
```

## Environment

### Backend (`backend/.dev.vars` or via `wrangler secret put`)

| Name | Description |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL (e.g. `https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_KEY` | Service role key (NEVER expose to the client) |
| `ADMIN_PASSWORD_HASH` | SHA-256 hex of the admin password |
| `JWT_SECRET` | Random secret used to sign admin JWTs |
| `CORS_ORIGIN` | Allowed origin (e.g. `https://demonzdevelopment.online`) |
| `DEV` | Set to `1` in dev to allow `http://localhost:5173` in CORS |

Generate a fresh password hash:

```sh
cd backend
npm run hash-password -- "your-password"
```

### Frontend (`frontend/.env.local`)

| Name | Default | Description |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | Backend API base URL. Leave unset in dev (Vite proxy handles `/api`). |

## Database

The backend expects a Supabase project with the following tables: `projects`,
`articles`, `changelogs`, `comments`, `contact_messages`.

After applying the schema, run the migration in `backend/supabase/migrations/`:

```sh
psql "$SUPABASE_DB_URL" -f backend/supabase/migrations/0001_increment_downloads.sql
```

This creates the `increment_downloads(text)` RPC used by the download endpoint
to safely increment counters without a read-modify-write race.

## CI

A single GitHub Action runs on push/PR to `main`:

- Backend: `tsc --noEmit` + `vitest`
- Frontend: `eslint` + `tsc -b` + `vitest` + `vite build`

## Deployment

- **Public Site (`frontend/`)**: Cloudflare Pages
  - Root directory: `frontend`
  - Build command: `npm run build`
  - Build output directory: `dist`
  - Custom Domain: Bind your custom domain (e.g. `demonzdevelopment.online`) in the Cloudflare Pages settings.
- **Admin Panel (`admin-frontend/`)**: Cloudflare Pages (pages.dev Deployment)
  - Root directory: `admin-frontend`
  - Build command: `npm run build`
  - Build output directory: `dist`
  - Domain: Keep the default `[project-name].pages.dev` for security.
- **Backend API (`backend/`)**: Cloudflare Workers
  - Deploy via `wrangler deploy` from the `backend/` directory.
  - Set wrangler secrets using `wrangler secret put <SECRET_NAME>`.

## License

Code in this repository is released under the MIT license unless noted
otherwise inside an individual project folder. Trademarks, logos, and game
artwork are not covered.
