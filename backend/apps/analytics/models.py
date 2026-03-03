from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class DailyUserSnapshot(models.Model):
    """
    Pre-computed daily summary per user.
    Instead of computing stats on every dashboard load (slow),
    we compute once per day and store here (fast reads).
    This is a common production pattern called 'materialized views'.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="daily_snapshots")
    date = models.DateField()

    # Network
    avg_download = models.FloatField(default=0)
    avg_upload = models.FloatField(default=0)
    avg_latency = models.FloatField(default=0)
    avg_quality_score = models.FloatField(default=0)
    network_tests_count = models.IntegerField(default=0)

    # Learning
    lessons_completed = models.IntegerField(default=0)
    time_spent_minutes = models.IntegerField(default=0)
    courses_active = models.IntegerField(default=0)

    class Meta:
        db_table = "daily_user_snapshots"
        unique_together = [["user", "date"]]
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.email} snapshot {self.date}"
