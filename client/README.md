# vcron — Frontend

Next.js frontend for vcron, a cron job scheduler for HTTP endpoints.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Manrope font
- JWT cookie auth

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BACKEND_URL` | Backend API URL | `http://localhost:8080` |

## Deploy on Vercel

1. Push to GitHub
2. Import project on Vercel
3. Set `BACKEND_URL` env var to your backend URL
4. Deploy

## Project Structure

```
src/app/
  (root)/          — Public routes (landing, auth)
  (secure)/        — Authenticated routes (dashboard, logs, apps, jobs)
src/components/    — Shared components
src/lib/           — API client, types, utils, hooks
src/hooks/         — Custom hooks
public/            — Static assets (logos, icons)
```
