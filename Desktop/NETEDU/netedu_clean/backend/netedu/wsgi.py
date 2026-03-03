"""
backend/netedu/wsgi.py
WSGI = Web Server Gateway Interface — how Django talks to web servers like Nginx/Gunicorn.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "netedu.settings")
application = get_wsgi_application()
