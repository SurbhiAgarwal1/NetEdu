"""
backend/netedu/settings.py
──────────────────────────
Main Django settings file.

HOW DJANGO SETTINGS WORK:
- Django reads this file when it starts.
- We use django-environ to load variables from .env so secrets
  never live in source code.
- All config that differs between dev/prod comes from env vars.
"""

import environ
import os
import sys
from pathlib import Path

# ── Base directory ─────────────────────────────────────────────────────────
# BASE_DIR points to the /backend folder (where manage.py lives)
BASE_DIR = Path(__file__).resolve().parent.parent

# ── Load environment variables ─────────────────────────────────────────────
# environ.Env() creates a helper that reads from os.environ (which Docker
# and docker-compose populate from .env)
env = environ.Env(
    DEBUG=(bool, False),   # default DEBUG to False (safe for prod)
)
environ.Env.read_env(BASE_DIR / ".env")   # also reads .env file if present

# ── Core settings ──────────────────────────────────────────────────────────
SECRET_KEY = env("SECRET_KEY")
DEBUG = env("DEBUG")
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

# ── Application definition ─────────────────────────────────────────────────
# Django apps are modular pieces. Order matters — put third-party before yours.
INSTALLED_APPS = [
    "django.contrib.admin",          # Admin panel at /admin/
    "django.contrib.auth",           # Built-in User model & auth
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",                # Django REST Framework (DRF)
    "rest_framework_simplejwt",      # JWT tokens
    "corsheaders",                   # CORS for React frontend
    "django_filters",                # Filter support in DRF
    "drf_spectacular",               # OpenAPI schema generation

    # Our apps (each is a folder inside apps/)
    "apps.users",
    "apps.network",
    "apps.learning",
    "apps.analytics",
]

# ── Middleware ─────────────────────────────────────────────────────────────
# Middleware = functions that run on every request/response (like Express middleware)
# CorsMiddleware MUST be first to add CORS headers before anything else runs.
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",          # ← must be first
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",     # serve static files
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "netedu.urls"   # tells Django where URL patterns live

# ── Templates (needed for Django admin) ───────────────────────────────────
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "netedu.wsgi.application"

# ── Database ───────────────────────────────────────────────────────────────
# dj_database_url.parse converts a URL like:
#   postgresql://user:pass@host:5432/dbname
# into the dict format Django expects.
import dj_database_url

DATABASES = {
    "default": dj_database_url.config(
        env="DATABASE_URL",
        default=f"postgresql://{env('POSTGRES_USER', default='netedu_user')}:"
                f"{env('POSTGRES_PASSWORD', default='netedu_pass')}@"
                f"{env('POSTGRES_HOST', default='localhost')}:"
                f"{env('POSTGRES_PORT', default='5432')}/"
                f"{env('POSTGRES_DB', default='netedu')}",
        conn_max_age=600,
    )
}

# ── Auth ───────────────────────────────────────────────────────────────────
AUTH_USER_MODEL = "users.User"   # use our custom User model (extends Django's)

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ── Django REST Framework ──────────────────────────────────────────────────
REST_FRAMEWORK = {
    # Default: all endpoints require a valid JWT token
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    # Return JSON with readable date format
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    # Pagination — return 20 items per page by default
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    # Filtering support
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    # Basic abuse protection; can be tuned with env overrides.
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": env("THROTTLE_ANON_RATE", default="60/min"),
        "user": env("THROTTLE_USER_RATE", default="300/min"),
        "auth_login": env("THROTTLE_AUTH_LOGIN_RATE", default="10/min"),
        "auth_register": env("THROTTLE_AUTH_REGISTER_RATE", default="5/min"),
    },
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

# Disable throttling during pytest runs to avoid cross-test interference.
if "pytest" in sys.modules or os.environ.get("PYTEST_CURRENT_TEST"):
    REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"] = []

SPECTACULAR_SETTINGS = {
    "TITLE": "NetEdu API",
    "DESCRIPTION": "Network-aware learning platform API",
    "VERSION": "1.0.0",
}

# ── JWT Configuration ──────────────────────────────────────────────────────
from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(seconds=env.int("ACCESS_TOKEN_LIFETIME", default=3600)),
    "REFRESH_TOKEN_LIFETIME": timedelta(seconds=env.int("REFRESH_TOKEN_LIFETIME", default=86400)),
    "ROTATE_REFRESH_TOKENS": True,    # give new refresh token on each refresh
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ── CORS ───────────────────────────────────────────────────────────────────
# Allow React dev server to make API calls to Django
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:5173", "http://localhost:3000"]
)
CORS_ALLOW_CREDENTIALS = True

# ── Static files ───────────────────────────────────────────────────────────
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"      # where collectstatic puts files
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ── Internationalization ───────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ── Primary key type ───────────────────────────────────────────────────────
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
