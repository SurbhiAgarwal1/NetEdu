#!/usr/bin/env python
"""
manage.py
─────────
Django's command-line utility. You'll use this constantly:

  python manage.py runserver          → start dev server
  python manage.py makemigrations     → generate DB migration files from models
  python manage.py migrate            → apply migrations to database
  python manage.py createsuperuser    → create admin user
  python manage.py shell              → interactive Python shell with Django loaded
  python manage.py test               → run tests
"""
import os
import sys


def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "netedu.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed? "
            "Did you activate your virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
