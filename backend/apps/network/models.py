from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class NetworkMeasurement(models.Model):
    """Stores a single internet speed test result from a student."""

    class ConnectionType(models.TextChoices):
        WIFI = "wifi", "WiFi"
        MOBILE = "mobile", "Mobile Data"
        ETHERNET = "ethernet", "Ethernet"
        UNKNOWN = "unknown", "Unknown"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="measurements")

    # Speed metrics (Mbps)
    download_speed = models.FloatField(help_text="Download speed in Mbps")
    upload_speed = models.FloatField(help_text="Upload speed in Mbps")
    latency = models.FloatField(help_text="Latency in milliseconds")
    jitter = models.FloatField(default=0.0, help_text="Jitter in milliseconds")
    packet_loss = models.FloatField(default=0.0, help_text="Packet loss percentage")

    # Context
    connection_type = models.CharField(max_length=20, choices=ConnectionType.choices, default=ConnectionType.UNKNOWN)
    isp = models.CharField(max_length=200, blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    country = models.CharField(max_length=100, blank=True, default="")

    # Quality score (0-100) computed from metrics
    quality_score = models.FloatField(default=0.0)

    # M-Lab style metadata
    test_server = models.CharField(max_length=200, blank=True, default="")
    client_ip = models.GenericIPAddressField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "network_measurements"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["city", "country"]),
        ]

    def save(self, *args, **kwargs):
        self.quality_score = self._compute_quality_score()
        super().save(*args, **kwargs)

    def _compute_quality_score(self):
        """Simple quality scoring algorithm — shows data analysis skill."""
        score = 100.0
        # Penalize low download speed
        if self.download_speed < 1:
            score -= 50
        elif self.download_speed < 5:
            score -= 30
        elif self.download_speed < 25:
            score -= 10
        # Penalize high latency
        if self.latency > 200:
            score -= 30
        elif self.latency > 100:
            score -= 15
        elif self.latency > 50:
            score -= 5
        # Penalize packet loss
        score -= min(self.packet_loss * 5, 30)
        return max(0.0, round(score, 2))

    def __str__(self):
        return f"{self.user.email} — {self.download_speed}Mbps @ {self.created_at:%Y-%m-%d %H:%M}"
