"""
apps/network/views.py
─────────────────────
API endpoints for network measurements and statistics.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Avg, Count, Max, Min
from django.utils import timezone
from datetime import timedelta
import csv
from django.http import HttpResponse

from .models import NetworkMeasurement
from .serializers import NetworkMeasurementSerializer


class NetworkMeasurementViewSet(viewsets.ModelViewSet):
    """CRUD for network measurements."""
    serializer_class = NetworkMeasurementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NetworkMeasurement.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Aggregated statistics for the current user."""
        measurements = self.get_queryset()
        if not measurements.exists():
            return Response({
                'total_tests': 0,
                'avg_download': 0,
                'avg_upload': 0,
                'avg_latency': 0,
                'avg_quality': 0,
            })

        stats = measurements.aggregate(
            total_tests=Count('id'),
            avg_download=Avg('download_speed'),
            avg_upload=Avg('upload_speed'),
            avg_latency=Avg('latency'),
            avg_quality=Avg('quality_score'),
            max_download=Max('download_speed'),
            min_download=Min('download_speed'),
        )
        return Response({
            'total_tests': stats['total_tests'],
            'avg_download': round(stats['avg_download'] or 0, 2),
            'avg_upload': round(stats['avg_upload'] or 0, 2),
            'avg_latency': round(stats['avg_latency'] or 0, 2),
            'avg_quality': round(stats['avg_quality'] or 0, 2),
            'max_download': round(stats['max_download'] or 0, 2),
            'min_download': round(stats['min_download'] or 0, 2),
        })

    @action(detail=False, methods=['get'])
    def trend(self, request):
        """Last 30 measurements for charting."""
        measurements = self.get_queryset()[:30]
        serializer = self.get_serializer(measurements, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export user's measurements to CSV."""
        measurements = self.get_queryset()
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="network_measurements.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Date', 'Download (Mbps)', 'Upload (Mbps)', 'Latency (ms)', 
            'Jitter (ms)', 'Packet Loss (%)', 'Quality Score', 'Connection Type', 'City', 'ISP'
        ])
        
        for m in measurements:
            writer.writerow([
                m.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                m.download_speed,
                m.upload_speed,
                m.latency,
                m.jitter,
                m.packet_loss,
                m.quality_score,
                m.connection_type,
                m.city or '',
                m.isp or '',
            ])
        
        return response


@api_view(['GET'])
@permission_classes([AllowAny])
def public_stats(request):
    """
    Public endpoint: city-level aggregated network quality.
    No authentication required — open data for research.
    """
    # Get measurements from last 30 days
    since = timezone.now() - timedelta(days=30)
    measurements = NetworkMeasurement.objects.filter(
        created_at__gte=since,
        city__isnull=False
    ).exclude(city='')

    # Group by city
    city_stats = (
        measurements.values('city', 'country')
        .annotate(
            avg_download=Avg('download_speed'),
            avg_upload=Avg('upload_speed'),
            avg_latency=Avg('latency'),
            avg_quality=Avg('quality_score'),
            test_count=Count('id'),
        )
        .order_by('-test_count')[:50]  # top 50 cities
    )

    return Response({
        'period': '30 days',
        'cities': [
            {
                'city': stat['city'],
                'country': stat['country'] or 'Unknown',
                'avg_download': round(stat['avg_download'], 2),
                'avg_upload': round(stat['avg_upload'], 2),
                'avg_latency': round(stat['avg_latency'], 2),
                'avg_quality': round(stat['avg_quality'], 2),
                'test_count': stat['test_count'],
            }
            for stat in city_stats
        ]
    })
