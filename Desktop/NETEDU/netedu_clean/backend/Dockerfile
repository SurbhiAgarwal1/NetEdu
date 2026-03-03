# ── backend/Dockerfile ────────────────────────────────────────────────────────
# Stage 1: base — install OS deps
FROM python:3.12-slim AS base

# Don't write .pyc files, print logs immediately
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system libraries PostgreSQL client needs
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc curl \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: dependencies — install Python packages
FROM base AS deps
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Stage 3: final — copy your actual source code
FROM deps AS final
COPY . .

EXPOSE 8000

# Entrypoint runs migrations then starts Django dev server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
