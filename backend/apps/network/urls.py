from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .speed_test_views import ping, download_test, upload_test

router = DefaultRouter()
router.register(r'measurements', views.NetworkMeasurementViewSet, basename='measurement')

urlpatterns = [
    path("", include(router.urls)),
    path("public-stats/", views.public_stats, name="public-stats"),
    # Real speed test endpoints
    path("ping/", ping, name="network-ping"),
    path("download-test/", download_test, name="network-download-test"),
    path("upload-test/", upload_test, name="network-upload-test"),
]
