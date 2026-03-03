"""
apps/users/serializers.py
─────────────────────────
WHAT ARE SERIALIZERS?
Serializers are like Express's req.body validators + JSON transformers combined.
They do two things:
  1. Serialization:   Python object → JSON  (for API responses)
  2. Deserialization: JSON → Python object  (for incoming requests, with validation)

Think of them as the "schema" layer between your database and your API.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Used for POST /api/auth/register/
    Accepts: email, password, confirm_password, first_name, last_name, role
    """
    password = serializers.CharField(
        write_only=True,        # never include password in response JSON
        required=True,
        validators=[validate_password]   # runs Django's password strength checks
    )
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            "id", "email", "password", "confirm_password",
            "first_name", "last_name", "role"
        ]

    def validate(self, attrs):
        """
        validate() runs cross-field validation.
        Each field's own validation runs first; then this method runs.
        """
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        """
        create() is called when serializer.save() is invoked in the view.
        We remove confirm_password (not a model field) before creating the user.
        """
        validated_data.pop("confirm_password")
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Used for GET /api/users/me/ and PATCH /api/users/me/
    Returns the full user profile.
    """
    full_name = serializers.ReadOnlyField()   # from the @property in the model

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "full_name",
            "role", "bio", "school", "city", "country",
            "avatar", "date_joined", "is_active"
        ]
        read_only_fields = ["id", "email", "date_joined", "is_active"]


class UserPublicSerializer(serializers.ModelSerializer):
    """
    Minimal user info safe to show to other users (no email).
    Used inside nested serializers (e.g., showing who created a course).
    """
    class Meta:
        model = User
        fields = ["id", "full_name", "role", "avatar"]
