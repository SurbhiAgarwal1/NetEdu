# NetEdu — Network-Aware Learning Platform

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/netedu/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/netedu/actions)
![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![Django](https://img.shields.io/badge/Django-5.0-green?logo=django)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)

> A full-stack platform that measures real internet quality and correlates it with learning progress — helping students understand how their connectivity affects their education.

---

## ✨ Features

### 🚀 Real Speed Test Engine
- **Multi-stream measurement** — 4 parallel download streams, like fast.com
- **NDT7-inspired methodology** — same approach used by M-Lab
- Measures download, upload, latency, jitter, packet loss
- Animated live gauge UI with progress rings
- Auto-detects connection type via Navigator API

### 📊 Network-Learning Correlation *(Unique Feature)*
- Computes **Pearson correlation** between daily network quality and lessons completed
- Built with Pandas `merge`, `groupby`, `corr`
- Scatter plot visualisation on the dashboard
- Human-readable insights: *"On days with better network, you complete 40% more lessons"*
- Actionable comparison: good vs poor network days

### 📈 Analytics Dashboard
- Recharts line, bar, scatter, and pie charts
- Pandas-powered server-side aggregations
- Quality score distribution histogram
- Daily activity heatmap

### 🌐 Open Data API
- `/api/network/public-stats/` — city-level aggregates, no auth required
- M-Lab style open data principles

### 🔐 Full Authentication
- JWT with auto-refresh
- Role-based access: Student / Teacher / Admin
- Custom User model (email-based login)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 5 + Django REST Framework |
| Database | PostgreSQL 16 |
| Auth | JWT (djangorestframework-simplejwt) |
| Data Analysis | Pandas + NumPy |
| Frontend | React 18 + TypeScript + Vite |
| Charts | Recharts |
| Speed Test | Browser Fetch API (NDT7-inspired) |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Reverse Proxy | Nginx |

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed — that's it!

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/netedu.git
cd netedu

# 2. Environment (pre-filled with dev defaults)
cp .env.example .env

# 3. Run everything
docker compose up --build

# 4. Create admin user (new terminal)
docker compose exec backend python manage.py createsuperuser
```

| Service | URL |
|---|---|
| React App | http://localhost:5173 |
| Django API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |

---

## 📁 Project Structure

```
netedu/
├── backend/
│   ├── apps/
│   │   ├── users/          # Custom User model, JWT auth
│   │   ├── network/        # Speed tests, NDT7 endpoints, M-Lab style stats
│   │   ├── learning/       # Courses, lessons, quizzes, progress
│   │   └── analytics/
│   │       ├── services.py     # Pandas aggregations
│   │       └── correlation.py  # Pearson correlation (unique feature)
│   ├── tests/              # 15+ pytest tests
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── hooks/
│   │   │   ├── useAuth.tsx       # JWT auth context
│   │   │   └── useSpeedTest.ts   # Real browser speed measurement
│   │   ├── components/
│   │   │   └── network/SpeedTestWidget.tsx  # Animated speed test UI
│   │   └── pages/          # Dashboard, Network, Learning
│   └── Dockerfile
├── nginx/nginx.conf
├── .github/workflows/ci.yml
└── docker-compose.yml
```

---

## 🔌 API Reference

### Speed Test (Real measurement)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/network/ping/` | Latency measurement |
| GET | `/network/download-test/` | Streams random bytes for download |
| POST | `/network/upload-test/` | Accepts bytes for upload measurement |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics/dashboard/` | Combined network + learning data |
| GET | `/analytics/correlation/` | **Pearson r: network quality vs learning** |
| GET | `/network/public-stats/` | Open data, no auth required |

---

## 🧪 Tests

```bash
docker compose exec backend pytest tests/ -v
```

---

## 🏗️ Architecture Decisions

**Why real speed tests?**
Simulated data is dishonest. The `useSpeedTest` hook uses browser `fetch()` with parallel streams and measures actual throughput — the same fundamental method as fast.com and M-Lab NDT7.

**Why Pandas for correlation?**
The correlation feature uses `pd.merge()` + `.corr()` — real data science, not fake. This directly demonstrates skills for M-Lab GSoC work.

**Why the correlation feature?**
No other learning platform correlates connectivity with learning outcomes. This is original, useful, and technically interesting — exactly what GSoC mentors look for.

---

## 🗺️ Roadmap

- [ ] WebSocket real-time updates  
- [ ] Celery scheduled analytics recomputation  
- [ ] Kubernetes manifests  
- [ ] Grafana + Prometheus monitoring  
- [ ] CSV open data export  

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

*Built as a GSoC preparation project. Stack mirrors [Learning Unlimited ESP-Website](https://github.com/learning-unlimited/ESP-Website) and [Measurement Lab](https://www.measurementlab.net/) tooling.*
