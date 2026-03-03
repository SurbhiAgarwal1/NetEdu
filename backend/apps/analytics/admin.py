from django.contrib import admin
from .models import DailyUserSnapshot

@admin.register(DailyUserSnapshot)
class DailyUserSnapshotAdmin(admin.ModelAdmin):
    list_display = ["user", "date", "avg_download", "avg_quality_score", "lessons_completed"]
    list_filter = ["date"]
    ordering = ["-date"]
