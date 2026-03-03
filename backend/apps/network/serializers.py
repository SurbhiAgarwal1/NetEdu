from rest_framework import serializers
from .models import NetworkMeasurement


class NetworkMeasurementSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source="user.email")

    class Meta:
        model = NetworkMeasurement
        fields = [
            "id", "user_email", "download_speed", "upload_speed",
            "latency", "jitter", "packet_loss", "connection_type",
            "isp", "city", "country", "quality_score",
            "test_server", "created_at",
        ]
        read_only_fields = ["id", "user_email", "quality_score", "created_at"]

    def validate_download_speed(self, value):
        if value < 0 or value > 10000:
            raise serializers.ValidationError("Download speed must be between 0 and 10000 Mbps.")
        return value

    def validate_latency(self, value):
        if value < 0 or value > 10000:
            raise serializers.ValidationError("Latency must be between 0 and 10000 ms.")
        return value


class NetworkStatsSerializer(serializers.Serializer):
    """Aggregated stats for the dashboard."""
    avg_download = serializers.FloatField()
    avg_upload = serializers.FloatField()
    avg_latency = serializers.FloatField()
    avg_quality_score = serializers.FloatField()
    total_tests = serializers.IntegerField()
    last_tested = serializers.DateTimeField(allow_null=True)
