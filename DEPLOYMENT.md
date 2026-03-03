# Deployment Guide (Vercel + Render)

This project deploys best as:
- Frontend on Vercel
- Backend + PostgreSQL on Render

## 1) Deploy Backend on Render

### Option A (recommended): Blueprint with `render.yaml`
1. Push this repo to GitHub.
2. Open Render -> `New` -> `Blueprint`.
3. Select your repo and deploy.
4. Render will create:
   - `netedu-backend` web service
   - `netedu-db` Postgres database

### Required backend env updates after first deploy
In Render service `Environment`, update:
- `ALLOWED_HOSTS` to your real backend domain
  - Example: `netedu-backend-xxxx.onrender.com`
- `CORS_ALLOWED_ORIGINS` to your real frontend domain
  - Example: `https://netedu-app.vercel.app`

## 2) Deploy Frontend on Vercel

1. Open Vercel -> `Add New Project`.
2. Import the same GitHub repo.
3. Set **Root Directory** to `frontend`.
4. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add env var:
   - `VITE_API_URL = https://<your-render-backend-domain>/api`
6. Deploy.

`frontend/vercel.json` is already added for SPA route fallback.

## 3) Final Cross-Origin Setup

After both are live:
1. Copy your real Vercel URL.
2. Put it into Render backend env:
   - `CORS_ALLOWED_ORIGINS=https://<your-vercel-domain>`
3. Ensure backend env:
   - `ALLOWED_HOSTS=<your-render-backend-domain>`
4. Redeploy backend.

## 4) Verify Production

Check these URLs:
- Backend health: `https://<backend-domain>/api/health/`
- Backend docs: `https://<backend-domain>/api/docs/`
- Frontend app: `https://<frontend-domain>`

Then test:
- register/login
- dashboard load
- speed test save
- leaderboard load

## Common Issues

- `CORS error`: backend `CORS_ALLOWED_ORIGINS` missing frontend domain.
- `DisallowedHost`: backend `ALLOWED_HOSTS` missing backend domain.
- Frontend cannot call API: wrong `VITE_API_URL` (must include `/api`).
