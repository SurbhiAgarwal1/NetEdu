from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .services import (
    get_network_analytics,
    get_learning_analytics,
    get_combined_dashboard,
    get_leaderboard,
    get_my_leaderboard_position,
)
from .correlation import compute_correlation


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard(request):
    """GET /api/analytics/dashboard/ — full dashboard data"""
    return Response(get_combined_dashboard(request.user))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def network_analytics(request):
    """GET /api/analytics/network/"""
    return Response(get_network_analytics(request.user))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def learning_analytics(request):
    """GET /api/analytics/learning/"""
    return Response(get_learning_analytics(request.user))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def correlation(request):
    """
    GET /api/analytics/correlation/
    THE UNIQUE FEATURE: Network quality vs learning output correlation.
    Computes Pearson r between daily network quality and lessons completed.
    """
    return Response(compute_correlation(request.user))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def leaderboard(request):
    """GET /api/analytics/leaderboard/ - real user leaderboard."""
    limit = min(max(int(request.query_params.get("limit", 20)), 1), 100)
    return Response(get_leaderboard(request.user, limit=limit))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_leaderboard_rank(request):
    """GET /api/analytics/leaderboard/me/ - current user's leaderboard position."""
    window = min(max(int(request.query_params.get("window", 2)), 0), 10)
    return Response(get_my_leaderboard_position(request.user, window=window))
