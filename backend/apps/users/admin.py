"""
apps/users/admin.py
───────────────────
Registering models here makes them appear in Django's /admin/ panel.
Django admin is a free, auto-generated CRUD interface — very useful for debugging.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "first_name", "last_name", "role", "is_active", "date_joined"]
    list_filter = ["role", "is_active", "is_staff"]
    search_fields = ["email", "first_name", "last_name"]
    ordering = ["-date_joined"]

    # What fields appear when you open a user in the admin
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal", {"fields": ("first_name", "last_name", "bio", "avatar")}),
        ("Location", {"fields": ("city", "country", "school")}),
        ("Permissions", {"fields": ("role", "is_active", "is_staff", "is_superuser", "groups")}),
        ("Dates", {"fields": ("date_joined", "last_login")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "first_name", "last_name", "password1", "password2", "role"),
        }),
    )
