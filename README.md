<br/>
<br/>
<p align="center">
  <a href="https://github.com/bluwwi/vcron"><img src="client/public/full-logo.svg" alt="vcron" height=70></a>
</p>
<h1 align="center">vcron — Cron Job Scheduler</h1>

<p align="center">
  <a href="https://github.com/bluwwi/vcron" target="_blank"><img height=20 src="https://img.shields.io/badge/github-bluwwi/vcron-181717?logo=github&logoColor=white" /></a>
  <img src="https://img.shields.io/github/stars/bluwwi/vcron" alt="stars">
  <a href="https://cron.bluwi.xyz"><img src="https://img.shields.io/static/v1?label=status&message=live&color=success" alt="status" /></a>
  <img src="https://img.shields.io/badge/backend-Rust-CE422B?logo=rust&logoColor=white" />
  <img src="https://img.shields.io/badge/frontend-Next.js-000000?logo=next.js&logoColor=white" />
</p>





## What is vcron?

vcron is a lightweight, self-hosted cron job scheduler for HTTP endpoints. Register your APIs, create scheduled jobs, and let vcron hit your endpoints on time — every time. Built in Rust with SQLite, designed to run on a 1GB VPS with minimal resource usage.

This repository contains **both** the backend (Rust + Axum + SQLite) and the frontend (Next.js 16 + React 19 + Tailwind CSS v4). The backend deploys on a VPS, the frontend deploys on Vercel — or anywhere else.

```bash
# Backend
cargo build --release
./target/release/vcron

# Frontend
cd client
npm install
npm run dev
```

## Features

- **Flexible scheduling** — Standard 5-field cron expressions or `interval:N` syntax for sub-minute intervals (30s minimum)
- **Multi-app support** — Register multiple APIs as apps, each with its own base URL. Jobs define relative paths (e.g. `/healthz`)
- **Built-in retries** — Automatic exponential backoff with configurable retry count and timeout per job
- **Run history** — Full execution logs with HTTP status codes, response bodies, durations, and error messages
- **Secure auth** — Username + password with bcrypt hashing and JWT cookie sessions. Data scoped per user
- **Pixel loader** — Custom canvas-based loading animation on first page visit
- **Real-time dashboard** — Live stats, auto-refreshing job lists, relative timestamps that tick every second
- **Borderless UI** — Dark editorial design inspired by portfolio aesthetics, glow cards, accent bars, noise texture

## Tech Stack

### Backend

| | |
|---|---|
| **Language** | Rust (edition 2021) |
| **Web framework** | Axum 0.8 |
| **Runtime** | Tokio (async) |
| **Database** | SQLite via sqlx 0.8 |
| **Auth** | bcrypt + jsonwebtoken (JWT httpOnly cookies) |
| **HTTP client** | reqwest 0.12 (rustls) |
| **Cron parsing** | cron 0.12 crate |
| **Logging** | tracing + tracing-subscriber |

### Frontend

| | |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **UI runtime** | React 19 |
| **Styling** | Tailwind CSS v4 |
| **Font** | Manrope (Google Fonts) |
| **Animations** | Custom canvas pixel loader, IntersectionObserver scroll reveals, JS-driven marquee |
| **Deploy** | Vercel |

### Infrastructure

| | |
|---|---|
| **Backend host** | VPS (1GB RAM minimum) |
| **Frontend host** | Vercel |
| **Reverse proxy** | Nginx |
| **SSL** | Let's Encrypt (Certbot) |
| **Process manager** | systemd |

## Architecture

```
User Browser → Vercel (Next.js) → VPS (Rust + SQLite)
                 │                      │
                 │  /api/* proxied      │  Scheduler ticks every 5s
                 │  via rewrites         │  Picks due jobs
                 │                       │  Spawns tokio tasks
                 ↓                       ↓
           Next.js renders         HTTP requests hit
           landing + dashboard     target URLs
```

## Install

### Backend (VPS)

> **Prerequisites:** Rust 1.85+ (or install via `snap install rustup --classic`), OpenSSL for JWT secret generation.

```sh
git clone https://github.com/bluwwi/vcron.git
cd vcron
cargo build --release
cp .env.example .env
# Edit .env — set JWT_SECRET (run: openssl rand -base64 32)
./target/release/vcron
```

Set up as a systemd service:

```sh
cat > /etc/systemd/system/vcron.service << 'EOF'
[Unit]
Description=vcron cron job server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/vcron
EnvironmentFile=/root/vcron/.env
ExecStart=/root/vcron/target/release/vcron
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable vcron
systemctl start vcron
```

Nginx reverse proxy:

```nginx
server {
    listen 80;
    server_name cron.bluwi.xyz;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```sh
certbot --nginx -d cron.bluwi.xyz
```

### Frontend (Vercel)

```sh
cd client
npm install
cp .env.example .env.local
# Edit .env.local — set BACKEND_URL=https://cron.bluwi.xyz
npm run dev
```

Or deploy on Vercel:
1. Import `bluwwi/vcron` from GitHub
2. Set Root Directory to `client`
3. Set env var: `BACKEND_URL=https://cron.bluwi.xyz`
4. Deploy

### Environment Variables

**Backend (`.env`):**

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `sqlite:data/vcron.db?mode=rwc` |
| `PORT` | Server port | `8080` |
| `RUST_LOG` | Log level | `vcron=info` |
| `SCHEDULER_INTERVAL_SECONDS` | How often scheduler checks for due jobs | `5` |
| `JWT_SECRET` | Secret for JWT token signing | (required) |

**Frontend (`.env.local`):**

| Variable | Description | Default |
|----------|-------------|---------|
| `BACKEND_URL` | Backend API URL | `http://localhost:8080` |

## API Reference

### Auth (public)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Create account (username + password) |
| `POST` | `/api/auth/login` | Sign in, returns JWT cookie |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/health` | Health check (no auth) |

### Authenticated routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/me` | Current user info |
| `GET` | `/api/apps` | List user's apps |
| `POST` | `/api/apps` | Create app (name + base_url) |
| `GET` | `/api/apps/{id}` | Get app detail |
| `PUT` | `/api/apps/{id}` | Update app |
| `DELETE` | `/api/apps/{id}` | Delete app + all its jobs |
| `GET` | `/api/apps/{id}/jobs` | List jobs in app |
| `GET` | `/api/apps/stats` | Per-app statistics |
| `POST` | `/api/jobs` | Create job (app_id + name + schedule + path) |
| `GET` | `/api/jobs` | List all jobs with app info |
| `GET` | `/api/jobs/{id}` | Get job detail with app info |
| `PUT` | `/api/jobs/{id}` | Update job |
| `DELETE` | `/api/jobs/{id}` | Delete job + run history |
| `GET` | `/api/jobs/{id}/runs` | List run history for job |
| `GET` | `/api/runs` | List all runs across all jobs |
| `GET` | `/api/stats` | Dashboard stats |

## Project Structure

```
vcron/
├── src/
│   ├── api/
│   │   ├── apps.rs          # App CRUD routes
│   │   ├── auth.rs          # Register, login, JWT middleware
│   │   ├── health.rs        # Health check endpoint
│   │   ├── jobs.rs          # Job CRUD + runs + stats routes
│   │   └── mod.rs           # Router assembly
│   ├── db/
│   │   ├── models.rs        # Data models (User, App, Job, JobRun, etc.)
│   │   ├── queries.rs       # All SQL queries (scoped by user_id)
│   │   └── mod.rs
│   ├── scheduler/
│   │   └── engine.rs        # Background scheduler loop
│   ├── executor/
│   │   └── http.rs          # HTTP job executor with retries
│   ├── config.rs            # Environment config
│   ├── error.rs             # Error types → HTTP status mapping
│   ├── main.rs              # Application entry point
│   └── util.rs              # Cron validation + next run calculation
├── migrations/
│   ├── 001_create_users_table.sql
│   ├── 002_create_apps_table.sql
│   ├── 003_create_jobs_table.sql
│   ├── 004_create_job_runs_table.sql
│   └── 005_add_updated_at_triggers.sql
├── client/                   # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (root)/       # Public routes (landing, auth)
│   │   │   └── (secure)/     # Authenticated routes (dashboard, logs, apps, jobs)
│   │   ├── components/       # Nav, PixelLoader, Marquee, ConfirmModal, JobForm, etc.
│   │   ├── hooks/            # useRevealer
│   │   └── lib/              # api.ts, types.ts, utils.ts, useTick, useInitialLoader
│   ├── public/               # Logos, icons
│   └── next.config.ts        # API rewrites to BACKEND_URL
├── Cargo.toml
├── .env.example
└── README.md
```

## How It Works

1. **Register your API** — Create an app with a base URL (e.g. `https://api.blu3.in`)
2. **Add jobs** — Define paths like `/healthz`, pick a schedule (every 30s, cron expression), set HTTP method and headers
3. **Relax** — vcron's scheduler ticks every 5 seconds, picks up due jobs, executes HTTP requests with retry support, and logs every result

The scheduler uses `tokio::time::interval` with a 5-second tick (configurable). Due jobs are fetched via a SQL query that joins `jobs` + `apps` for the full URL. Each execution spawns an independent tokio task that:
- Creates a `job_runs` record with `status='running'`
- Executes the HTTP request (with configurable timeout + exponential backoff retries)
- Updates the run record with status, status code, response body (truncated to 64KB), duration, and error
- Calculates the next run time and updates the job

## Resource Usage

| Metric | Value |
|--------|-------|
| Idle RAM | ~15-20 MB |
| Peak RAM (under load) | ~30-40 MB |
| Binary size (stripped) | ~5-8 MB |
| SQLite DB | grows with usage (auto-created) |

## Contributing

Issues and pull requests welcome. The project is a student-built educational project.

Build & typecheck:

```sh
# Backend
cargo build
cargo build --release  # optimized binary

# Frontend
cd client && npm run build
cd client && npx tsc --noEmit
```

## License

MIT — see [LICENSE](./LICENSE) for details.
