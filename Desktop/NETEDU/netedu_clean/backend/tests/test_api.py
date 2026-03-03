"""
tests/test_api.py
─────────────────
Real tests that mentors will look at and think "she knows what she's doing."
We test: registration, login, network measurement submission, analytics endpoint.
"""
import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.learning.models import Course, Enrollment, Lesson, LessonProgress

User = get_user_model()


# ── Fixtures ───────────────────────────────────────────────────────────────
# Fixtures are reusable test setup — like beforeEach in Jest

@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user(db):
    """Factory fixture to create a user."""
    def _create(email="test@example.com", password="StrongPass123!", **kwargs):
        return User.objects.create_user(
            email=email,
            password=password,
            first_name="Test",
            last_name="User",
            **kwargs
        )
    return _create


@pytest.fixture
def auth_client(api_client, create_user):
    """API client pre-authenticated with JWT token."""
    user = create_user()
    response = api_client.post("/api/auth/login/", {
        "email": "test@example.com",
        "password": "StrongPass123!"
    })
    token = response.data["access"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    api_client.user = user
    return api_client


# ── Auth Tests ─────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestRegistration:

    def test_register_success(self, api_client):
        response = api_client.post("/api/auth/register/", {
            "email": "newuser@example.com",
            "password": "StrongPass123!",
            "confirm_password": "StrongPass123!",
            "first_name": "Surbhi",
            "last_name": "Agarwal",
            "role": "student"
        })
        assert response.status_code == status.HTTP_201_CREATED
        assert "user" in response.data
        assert response.data["user"]["email"] == "newuser@example.com"

    def test_register_password_mismatch(self, api_client):
        response = api_client.post("/api/auth/register/", {
            "email": "test@example.com",
            "password": "StrongPass123!",
            "confirm_password": "WrongPass456!",
            "first_name": "Test",
            "last_name": "User",
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_duplicate_email(self, api_client, create_user):
        create_user(email="dup@example.com")
        response = api_client.post("/api/auth/register/", {
            "email": "dup@example.com",
            "password": "StrongPass123!",
            "confirm_password": "StrongPass123!",
            "first_name": "Dup",
            "last_name": "User",
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogin:

    def test_login_success(self, api_client, create_user):
        create_user()
        response = api_client.post("/api/auth/login/", {
            "email": "test@example.com",
            "password": "StrongPass123!"
        })
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data
        assert "user" in response.data

    def test_login_wrong_password(self, api_client, create_user):
        create_user()
        response = api_client.post("/api/auth/login/", {
            "email": "test@example.com",
            "password": "WrongPassword!"
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ── User Profile Tests ─────────────────────────────────────────────────────

@pytest.mark.django_db
class TestUserProfile:

    def test_get_my_profile(self, auth_client):
        response = auth_client.get("/api/users/me/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == "test@example.com"

    def test_update_profile(self, auth_client):
        response = auth_client.patch("/api/users/me/", {"bio": "I love learning!"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["bio"] == "I love learning!"

    def test_unauthenticated_profile_access(self, api_client):
        response = api_client.get("/api/users/me/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ── Network Measurement Tests ──────────────────────────────────────────────

@pytest.mark.django_db
class TestNetworkMeasurements:

    def test_submit_measurement(self, auth_client):
        response = auth_client.post("/api/network/measurements/", {
            "download_speed": 50.5,
            "upload_speed": 20.2,
            "latency": 30.0,
            "jitter": 2.5,
            "packet_loss": 0.1,
            "connection_type": "wifi",
            "city": "Bengaluru",
            "country": "India"
        })
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["quality_score"] > 0

    def test_list_measurements(self, auth_client):
        # Submit two measurements first
        for speed in [10.0, 50.0]:
            auth_client.post("/api/network/measurements/", {
                "download_speed": speed,
                "upload_speed": 5.0,
                "latency": 40.0,
            })
        response = auth_client.get("/api/network/measurements/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 2

    def test_network_stats(self, auth_client):
        auth_client.post("/api/network/measurements/", {
            "download_speed": 100.0,
            "upload_speed": 50.0,
            "latency": 10.0,
        })
        response = auth_client.get("/api/network/measurements/stats/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["total_tests"] == 1
        assert response.data["avg_download"] == 100.0

    def test_invalid_measurement(self, auth_client):
        response = auth_client.post("/api/network/measurements/", {
            "download_speed": -5,  # invalid
            "upload_speed": 10,
            "latency": 20,
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ── Analytics Tests ────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestAnalytics:

    def test_dashboard_empty_state(self, auth_client):
        """Dashboard should work even with no data."""
        response = auth_client.get("/api/analytics/dashboard/")
        assert response.status_code == status.HTTP_200_OK
        assert "network" in response.data
        assert "learning" in response.data

    def test_dashboard_with_data(self, auth_client):
        # Add a network measurement
        auth_client.post("/api/network/measurements/", {
            "download_speed": 75.0,
            "upload_speed": 30.0,
            "latency": 25.0,
        })
        response = auth_client.get("/api/analytics/dashboard/")
        assert response.status_code == status.HTTP_200_OK
        network = response.data["network"]
        assert not network["empty"]
        assert network["summary"]["avg_download"] == 75.0

    def test_leaderboard_endpoint(self, auth_client):
        response = auth_client.get("/api/analytics/leaderboard/")
        assert response.status_code == status.HTTP_200_OK
        assert "leaders" in response.data
        assert isinstance(response.data["leaders"], list)
    
    def test_my_rank_endpoint(self, auth_client):
        response = auth_client.get("/api/analytics/leaderboard/me/")
        assert response.status_code == status.HTTP_200_OK
        assert "found" in response.data
        assert "neighbors" in response.data
        assert isinstance(response.data["neighbors"], list)

    def test_leaderboard_ranking_with_learning_data(self, api_client, create_user):
        # Create two users and give one more completed lessons to rank higher.
        user_a = create_user(email="rank_a@example.com")
        user_b = create_user(email="rank_b@example.com")

        course = Course.objects.create(
            title="Ranking Course",
            description="Ranking test",
            instructor=user_a,
            is_published=True,
        )
        lesson1 = Lesson.objects.create(course=course, title="L1", content="x", order=1)
        lesson2 = Lesson.objects.create(course=course, title="L2", content="x", order=2)

        enr_a = Enrollment.objects.create(student=user_a, course=course)
        enr_b = Enrollment.objects.create(student=user_b, course=course)
        LessonProgress.objects.create(enrollment=enr_a, lesson=lesson1, is_completed=True)
        LessonProgress.objects.create(enrollment=enr_a, lesson=lesson2, is_completed=True)
        LessonProgress.objects.create(enrollment=enr_b, lesson=lesson1, is_completed=True)

        # Authenticate as user_a and request leaderboard.
        login = api_client.post("/api/auth/login/", {
            "email": "rank_a@example.com",
            "password": "StrongPass123!",
        })
        token = login.data["access"]
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = api_client.get("/api/analytics/leaderboard/?limit=10")
        assert response.status_code == status.HTTP_200_OK
        leaders = response.data["leaders"]
        assert len(leaders) >= 2
        assert leaders[0]["lessons_completed"] >= leaders[1]["lessons_completed"]
        assert leaders[0]["rank"] == 1


@pytest.mark.django_db
class TestHealth:
    def test_health_endpoint(self, api_client):
        response = api_client.get("/api/health/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "ok"
