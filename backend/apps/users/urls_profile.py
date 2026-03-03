"""
apps/users/urls_profile.py  — Profile endpoints
Mounted at /api/users/ in root urls.py
"""
from django.urls import path
from .views import MeView, UserListView

urlpatterns = [
    path("", UserListView.as_view(), name="user-list"),
    path("me/", MeView.as_view(), name="user-me"),
]
