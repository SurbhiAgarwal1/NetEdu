# NetEdu

NetEdu is a **Network-Aware Learning Platform**.  
It is a full-stack platform that measures internet quality and connects it with learning outcomes.  
Students can run real speed tests, track progress, study offline, and view a real-time leaderboard based on actual platform activity.

## Why This Project Matters

- Most edtech apps ignore network quality.
- NetEdu shows how connectivity impacts study consistency and performance.
- It combines networking metrics, analytics, and learning progress in one product.

## Core Features

### Authentication and User Management
- JWT authentication (access + refresh)
- Role-based users: student, teacher, admin
- Profile endpoint and secure token refresh handling

### Real Network Measurement
- Speed test flow with download, upload, latency, jitter, packet loss
- Network quality scoring and trend tracking
- Public aggregated network stats endpoint

### Learning System
- Courses, enrollments, lessons, quiz attempts
- Course progress tracking
- Offline learning support UI

### Analytics and Correlation
- Dashboard endpoint combining network + learning analytics
- Correlation endpoint for network quality vs learning activity
- Server-side analytics built with Pandas

### Real Leaderboard (No Mock Data)
- Backend-computed leaderboard from real user activity
- Scoring based on lessons, completed courses, streak, and quiz performance
- New personal rank endpoint:
  - current rank
  - percentile
  - neighboring users
- Frontend leaderboard includes:
  - search by student name
  - manual refresh
  - optional auto-refresh every 30 seconds
  - "Your Standing" summary card

### Product Polish
- Theme toggle
- Toast notifications
- Skeleton loading states
- Keyboard shortcuts
- Onboarding tour
- AI helper/chat component

## Tech Stack

- Backend: Django 5, Django REST Framework, SimpleJWT
- Data: PostgreSQL, Pandas, NumPy
- Frontend: React 18, TypeScript, Vite
- Charts/UI: Recharts, Lucide icons
- Infra: Docker, Docker Compose, Nginx
- Testing: Pytest (backend), Vitest + Testing Library (frontend)

## Architecture Overview

```text
netedu_clean/
├── backend/
│   ├── apps/
│   │   ├── users/
│   │   ├── network/
│   │   ├── learning/
│   │   └── analytics/
│   ├── netedu/
│   └── tests/
├── frontend/
│   └── src/
├── nginx/
└── docker-compose.yml
```

## Quick Start

### Prerequisites
- Docker Desktop

### Run the project

```bash
docker compose up -d --build
```

### Access URLs

- App (via Nginx): `http://localhost`
- Frontend dev server: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Health check: `http://localhost:8000/api/health/`
- API docs: `http://localhost:8000/api/docs/`

## Production Deployment

- Frontend: Vercel (`frontend` as root directory)
- Backend + DB: Render (Blueprint via `render.yaml`)
- Full guide: [DEPLOYMENT.md](DEPLOYMENT.md)

## Useful Commands

### Backend tests
```bash
docker compose exec backend pytest tests/test_api.py -q
```

### Frontend tests
```bash
cd frontend
npm run test
```

### Frontend type check
```bash
cd frontend
npx tsc --noEmit
```

## Key API Endpoints

### Auth
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`

### User
- `GET /api/users/me/`
- `PATCH /api/users/me/`

### Network
- `GET /api/network/measurements/`
- `POST /api/network/measurements/`
- `GET /api/network/measurements/stats/`
- `GET /api/network/measurements/trend/`
- `GET /api/network/public-stats/`
- `GET /api/network/measurements/export_csv/`

### Learning
- `GET /api/learning/courses/`
- `GET /api/learning/enrollments/`
- `POST /api/learning/enrollments/`

### Analytics
- `GET /api/analytics/dashboard/`
- `GET /api/analytics/correlation/`
- `GET /api/analytics/leaderboard/?limit=50`
- `GET /api/analytics/leaderboard/me/?window=2`

## Current Quality Status

- Backend API tests: passing
- Frontend unit tests: passing
- TypeScript type check: passing
- Dockerized local environment: working

## Roadmap (Next Upgrades)

- WebSocket live updates (leaderboard + network events)
- Background jobs with Celery
- Email reports and scheduled analytics
- Observability (metrics + tracing)
- Deployment hardening (staging/prod workflows)

## License

MIT License. See [LICENSE](LICENSE).
