"""
backend/netedu/urls.py
──────────────────────
Root URL configuration.

Think of this as Express's app.js where you mount routers.
Each app has its own urls.py; we include them here with a prefix.

URL layout:
  /api/auth/      → JWT login, refresh, register
  /api/users/     → User profiles
  /api/network/   → Speed test measurements
  /api/learning/  → Courses, lessons, progress
  /api/analytics/ → Dashboard aggregations
  /admin/         → Django admin panel (free!)
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Lightweight readiness/liveness endpoint."""
    return Response({"status": "ok"})

urlpatterns = [
    # Django admin — go to http://localhost:8000/admin/
    # Run: python manage.py createsuperuser  to create an admin account
    path("admin/", admin.site.urls),

    # Auth endpoints (login, refresh token)
    path("api/auth/", include("apps.users.urls")),

    # Feature endpoints
    path("api/users/", include("apps.users.urls_profile")),
    path("api/network/", include("apps.network.urls")),
    path("api/learning/", include("apps.learning.urls")),
    path("api/analytics/", include("apps.analytics.urls")),
    path("api/health/", health_check, name="health-check"),
    path("api/schema/", SpectacularAPIView.as_view(), name="api-schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="api-schema"), name="api-docs"),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
