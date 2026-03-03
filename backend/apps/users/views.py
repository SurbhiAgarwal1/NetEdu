"""
apps/users/views.py
───────────────────
WHAT ARE VIEWS?
Views are like Express route handlers. They receive a request and return a response.

Django REST Framework gives us:
  - APIView: class-based, explicit get()/post()/put()/delete() methods
  - generics.*: pre-built views for common CRUD patterns (less code!)
  - @api_view: function-based decorator for simple endpoints

We'll use generics where possible — less boilerplate, same power.
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

from .serializers import UserRegistrationSerializer, UserProfileSerializer
import os
import sys

User = get_user_model()
TESTING = "pytest" in sys.modules or bool(os.environ.get("PYTEST_CURRENT_TEST"))


# ── Custom JWT serializer: add user info to token response ─────────────────
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Override JWT login to also return user profile data.
    Default response: {access: "...", refresh: "..."}
    Our response:     {access: "...", refresh: "...", user: {...}}
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user data to the login response
        data["user"] = UserProfileSerializer(self.user).data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [] if TESTING else [ScopedRateThrottle]
    throttle_scope = "auth_login"


# ── Register ───────────────────────────────────────────────────────────────
class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Anyone can register (no auth required).
    
    CreateAPIView handles POST → create automatically.
    We just point it at our serializer.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]   # override the default (IsAuthenticated)
    throttle_classes = [] if TESTING else [ScopedRateThrottle]
    throttle_scope = "auth_register"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "message": "Account created successfully.",
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


# ── Current user profile ───────────────────────────────────────────────────
class MeView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/users/me/  → return current user's profile
    PATCH /api/users/me/ → update current user's profile

    RetrieveUpdateAPIView handles both GET and PATCH/PUT.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # request.user is automatically set by JWT middleware
        return self.request.user


# ── User list (admin only) ────────────────────────────────────────────────
class UserListView(generics.ListAPIView):
    """
    GET /api/users/
    Only admins can see all users.
    """
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ["email", "first_name", "last_name"]
    ordering_fields = ["date_joined", "first_name"]
