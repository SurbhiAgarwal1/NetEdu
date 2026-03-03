"""
apps/users/models.py
────────────────────
WHAT ARE MODELS?
A model is a Python class that maps to a database table.
Django reads your model class and creates/alters the SQL table automatically via migrations.

WHY CUSTOM USER MODEL?
Django has a built-in User model, but it's limited.
We extend AbstractBaseUser to add fields like:
  - role (student/teacher/admin)
  - bio
  - school
Best practice: ALWAYS create a custom user model at the start of a project.
Changing it later is very painful.
"""

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """
    Manager = the interface to query the database.
    We override it to support email-based login (instead of username).
    """

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)   # lowercase the domain part
        user = self.model(email=email, **extra_fields)
        user.set_password(password)           # hashes the password — never store plain text!
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model.
    
    AbstractBaseUser gives us: password hashing, last_login
    PermissionsMixin gives us: is_superuser, groups, user_permissions
    """

    class Role(models.TextChoices):
        # TextChoices = an enum stored as text in the DB
        STUDENT = "student", "Student"
        TEACHER = "teacher", "Teacher"
        ADMIN = "admin", "Admin"

    # ── Fields ──────────────────────────────────────────────────────────────
    email = models.EmailField(unique=True)           # login credential
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    bio = models.TextField(blank=True, default="")
    school = models.CharField(max_length=200, blank=True, default="")
    avatar = models.CharField(max_length=500, blank=True, default="", help_text="URL to avatar image")

    # Location info (useful for M-Lab style network analysis)
    city = models.CharField(max_length=100, blank=True, default="")
    country = models.CharField(max_length=100, blank=True, default="")

    # Django-required fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)    # can access /admin/
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()   # attach our custom manager

    USERNAME_FIELD = "email"               # use email to log in
    REQUIRED_FIELDS = ["first_name", "last_name"]  # asked by createsuperuser

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} <{self.email}>"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
