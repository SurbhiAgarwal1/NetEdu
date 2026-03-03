from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/",     views.dashboard,          name="analytics-dashboard"),
    path("network/",       views.network_analytics,  name="analytics-network"),
    path("learning/",      views.learning_analytics, name="analytics-learning"),
    path("correlation/",   views.correlation,        name="analytics-correlation"),
    path("leaderboard/",   views.leaderboard,        name="analytics-leaderboard"),
    path("leaderboard/me/", views.my_leaderboard_rank, name="analytics-leaderboard-me"),
]
