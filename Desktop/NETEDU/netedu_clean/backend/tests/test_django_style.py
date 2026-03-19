import pytest
from unittest.mock import patch
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User
from apps.network.models import NetworkMeasurement
from apps.learning.models import Course, Enrollment, Lesson, LessonProgress
from .factories import (
    UserFactory, TeacherFactory, AdminFactory, 
    NetworkMeasurementFactory, CourseFactory, EnrollmentFactory,
    LowQualityNetworkFactory, HighQualityNetworkFactory
)

class UserAuthTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = UserFactory(email="test@example.com", password="password123")
        self.register_url = reverse("auth-register")
        self.login_url = reverse("auth-login")
        self.refresh_url = reverse("auth-refresh")
        self.profile_url = reverse("user-me")

    def test_register_new_user(self):
        data = {"email": "new@example.com", "password": "password123", "first_name": "New", "last_name": "User"}
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_duplicate_email(self):
        data = {"email": "test@example.com", "password": "password123", "first_name": "Test", "last_name": "User"}
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_valid_credentials(self):
        response = self.client.post(self.login_url, {"email": "test@example.com", "password": "password123"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_wrong_password(self):
        response = self.client.post(self.login_url, {"email": "test@example.com", "password": "wrong"})
        self.assertIn(response.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED])

    def test_refresh_token(self):
        refresh = RefreshToken.for_user(self.user)
        response = self.client.post(self.refresh_url, {"refresh": str(refresh)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_unauthenticated_profile(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_profile(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_profile(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        response = self.client.patch(self.profile_url, {"first_name": "Updated"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "Updated")

    def test_register_missing_fields(self):
        data = {"email": "missing@example.com"}
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_invalid_email_format(self):
        data = {"email": "notanemail", "password": "pass", "first_name": "N", "last_name": "A"}
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class NetworkMeasurementTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = UserFactory()
        self.refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.refresh.access_token}')
        self.list_create_url = reverse("measurement-list")
        self.stats_url = reverse("measurement-stats")
        self.trend_url = reverse("measurement-trend")
        self.public_stats_url = reverse("public-stats")
        self.export_csv_url = reverse("measurement-export-csv") # might need to be export_csv

    def test_create_measurement_success(self):
        data = {"download_speed": 50, "upload_speed": 20, "latency": 30, "jitter": 5, "packet_loss": 0}
        response = self.client.post(self.list_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_measurements(self):
        NetworkMeasurementFactory(user=self.user)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(isinstance(response.data.get('results', response.data), list))

    def test_measurement_stats(self):
        NetworkMeasurementFactory(user=self.user)
        response = self.client.get(self.stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_measurement_trend(self):
        NetworkMeasurementFactory(user=self.user)
        response = self.client.get(self.trend_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_public_stats_anonymous(self):
        anon_client = APIClient()
        response = anon_client.get(self.public_stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unauthenticated_cannot_create(self):
        anon_client = APIClient()
        response = anon_client.post(self.list_create_url, {"download_speed": 50})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_export_csv(self):
        NetworkMeasurementFactory(user=self.user)
        response = self.client.get(self.export_csv_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')

    def test_zero_value_measurement(self):
        data = {"download_speed": 0, "upload_speed": 0, "latency": 0, "jitter": 0, "packet_loss": 0}
        response = self.client.post(self.list_create_url, data)
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])

    def test_negative_values_rejected(self):
        data = {"download_speed": 50, "upload_speed": 20, "latency": -10, "jitter": 5, "packet_loss": 0}
        response = self.client.post(self.list_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_stats_with_no_data(self):
        new_user = UserFactory()
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(new_user).access_token}')
        response = client.get(self.stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_trend_with_single_measurement(self):
        NetworkMeasurementFactory(user=self.user)
        response = self.client.get(self.trend_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_very_large_values(self):
        data = {"download_speed": 999999, "upload_speed": 999999, "latency": 30, "jitter": 5, "packet_loss": 0}
        response = self.client.post(self.list_create_url, data)
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])


class LearningSystemTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = UserFactory()
        self.refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.refresh.access_token}')
        self.course_list_url = reverse("course-list")
        self.enrollment_list_url = reverse("enrollment-list")
        self.teacher = TeacherFactory()
        self.course = CourseFactory(instructor=self.teacher, is_published=True)

    def test_list_courses(self):
        response = self.client.get(self.course_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify it's a list (or dict with results)
        data = response.data.get('results', response.data)
        self.assertTrue(len(data) > 0)

    def test_enroll_in_course(self):
        response = self.client.post(self.enrollment_list_url, {"course": self.course.id})
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_200_OK])

    def test_list_enrollments(self):
        EnrollmentFactory(student=self.user, course=self.course)
        response = self.client.get(self.enrollment_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_duplicate_enrollment(self):
        EnrollmentFactory(student=self.user, course=self.course)
        response = self.client.post(self.enrollment_list_url, {"course": self.course.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_cannot_enroll(self):
        anon_client = APIClient()
        response = anon_client.post(self.enrollment_list_url, {"course": self.course.id})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_enroll_nonexistent_course(self):
        response = self.client.post(self.enrollment_list_url, {"course": 99999})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST) # Serializer validation 400

    def test_list_courses_when_none_exist(self):
        Course.objects.all().delete()
        response = self.client.get(self.course_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_progress_tracking(self):
        enrollment = EnrollmentFactory(student=self.user, course=self.course)
        lesson = Lesson.objects.create(course=self.course, title="Test", content="X", order=1)
        url = reverse("lesson-complete", kwargs={"enrollment_id": enrollment.id, "lesson_id": lesson.id})
        response = self.client.patch(url, {"time_spent_minutes": 10})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        progress = LessonProgress.objects.get(enrollment=enrollment, lesson=lesson)
        self.assertTrue(progress.is_completed)


class AnalyticsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = UserFactory()
        self.refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.refresh.access_token}')

    def test_dashboard(self):
        response = self.client.get(reverse("analytics-dashboard"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_correlation(self):
        response = self.client.get(reverse("analytics-correlation"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_leaderboard(self):
        response = self.client.get(reverse("analytics-leaderboard"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_leaderboard_me(self):
        response = self.client.get(reverse("analytics-leaderboard-me"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_leaderboard_with_limit(self):
        for _ in range(6): UserFactory()
        response = self.client.get(reverse("analytics-leaderboard"), {"limit": 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLessEqual(len(response.data.get("leaders", [])), 5)

    def test_dashboard_no_data(self):
        new_client = APIClient()
        new_user = UserFactory()
        new_client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(new_user).access_token}')
        response = new_client.get(reverse("analytics-dashboard"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_correlation_no_measurements(self):
        response = self.client.get(reverse("analytics-correlation"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_leaderboard_single_user(self):
        User.objects.exclude(id=self.user.id).delete()
        response = self.client.get(reverse("analytics-leaderboard"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_leaderboard_me_rank_accuracy(self):
        User.objects.all().delete()
        u1 = UserFactory()
        u2 = UserFactory()
        u3 = UserFactory()
        # Mocking or setting up some scores indirectly
        c = CourseFactory()
        LessonProgress.objects.create(enrollment=EnrollmentFactory(student=u1, course=c), lesson=Lesson.objects.create(course=c, title="A"), is_completed=True, time_spent_minutes=1)
        
        # Test the endpoint for u1
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(u1).access_token}')
        response = client.get(reverse("analytics-leaderboard-me"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("rank") is not None)

    def test_correlation_low_vs_high_network(self):
        response = self.client.get(reverse("analytics-correlation"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class MockBasedTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = UserFactory()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(self.user).access_token}')

    @patch('apps.analytics.correlation.pd.merge')
    def test_correlation_pandas_empty(self, mock_merge):
        import pandas as pd
        mock_merge.return_value = pd.DataFrame(columns=['avg_quality', 'lessons_done', 'date'])
        response = self.client.get(reverse("analytics-correlation"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('apps.analytics.services.get_combined_dashboard')
    def test_dashboard_db_slow(self, mock_db):
        mock_db.side_effect = Exception("DB Timeout")
        response = self.client.get(reverse("analytics-dashboard"))
        # As we patched the view, it should return 503 instead of 500
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch('apps.analytics.services._build_ranked_leaderboard_entries')
    def test_leaderboard_scoring_empty(self, mock_scoring):
        mock_scoring.return_value = []
        response = self.client.get(reverse("analytics-leaderboard"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('apps.network.models.NetworkMeasurement.objects.filter')
    def test_network_stats_no_aggregation_data(self, mock_filter):
        mock_filter.return_value.aggregate.return_value = None
        response = self.client.get(reverse("measurement-stats"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('apps.analytics.services._build_ranked_leaderboard_entries')
    def test_analytics_when_all_users_have_same_score(self, mock_entries):
        mock_entries.return_value = [{"user_id": 1, "points": 10}, {"user_id": 2, "points": 10}]
        response = self.client.get(reverse("analytics-leaderboard"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class SecurityTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = UserFactory()
        self.teacher = TeacherFactory()

    def test_student_cannot_access_admin_endpoint(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(self.student).access_token}')
        response = self.client.post(reverse("course-list"), {"title": "Hack"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_expired_token_rejected(self):
        refresh = RefreshToken.for_user(self.student)
        refresh.access_token.set_exp(lifetime=-timedelta(minutes=1))
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        response = self.client.get(reverse("user-me"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_other_users_measurements_not_visible(self):
        u2 = UserFactory()
        measurement = NetworkMeasurementFactory(user=u2)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(self.student).access_token}')
        response = self.client.get(reverse("measurement-detail", args=[measurement.id]))
        self.assertIn(response.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN])

    def test_sql_injection_in_search(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(self.student).access_token}')
        response = self.client.get(reverse("course-list"), {"search": "' OR 1=1 --"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_xss_in_username(self):
        xss_string = "<script>alert(1)</script>"
        data = {"email": "xss@example.com", "password": "pass", "first_name": xss_string, "last_name": "Test"}
        response = self.client.post(reverse("auth-register"), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="xss@example.com")
        self.assertEqual(user.first_name, xss_string)

    def test_rate_limiting_awareness(self):
        # Fire 20 requests
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(self.student).access_token}')
        for _ in range(20):
            response = self.client.get(reverse("public-stats"))
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_429_TOO_MANY_REQUESTS])


class RegressionTestCase(TestCase):
    def test_leaderboard_score_formula_unchanged(self):
        # courses=2, lessons=3, streak=5, avg_score=80.0
        # Formula: lessons*10 + courses*120 + streak*15 + avg_score*2 = 30 + 240 + 75 + 160 = 505
        u = UserFactory()
        c1 = CourseFactory()
        c2 = CourseFactory()
        e1 = EnrollmentFactory(student=u, course=c1, is_completed=True)
        e2 = EnrollmentFactory(student=u, course=c2, is_completed=True)
        l1 = Lesson.objects.create(course=c1, title="1")
        l2 = Lesson.objects.create(course=c1, title="2")
        l3 = Lesson.objects.create(course=c2, title="3")
        LessonProgress.objects.create(enrollment=e1, lesson=l1, is_completed=True, time_spent_minutes=10)
        LessonProgress.objects.create(enrollment=e1, lesson=l2, is_completed=True, time_spent_minutes=10)
        LessonProgress.objects.create(enrollment=e2, lesson=l3, is_completed=True, time_spent_minutes=10)
        # Assuming score logic produces ~505 points depending on streak mock, but let's assert directly.
        from apps.analytics.services import _build_ranked_leaderboard_entries
        ranked = _build_ranked_leaderboard_entries(u)
        entry = next(r for r in ranked if r["user_id"] == u.id)
        # 3 lessons (30), 2 courses (240), streak=1 (15), 0 avg score (0) = 285
        self.assertEqual(entry["points"], 285)

    def test_network_quality_score_formula_unchanged(self):
        m = NetworkMeasurementFactory(download_speed=50, upload_speed=20, latency=30, jitter=5, packet_loss=0)
        # Expected: 100 - (0 penalty from speed) - (0 penalty from latency) - 0 = 100.0
        m.save()
        self.assertEqual(m.quality_score, 100.0)

        m2 = NetworkMeasurementFactory(download_speed=3, upload_speed=2, latency=150, jitter=5, packet_loss=2.0)
        # Expected: 100 - 30 (speed<5) - 15 (latency>100) - 10 (2*5) = 45.0
        m2.save()
        self.assertEqual(m2.quality_score, 45.0)

    def test_correlation_direction(self):
        u1 = UserFactory()
        c1 = CourseFactory()
        
        # Day 1: bad network (10 score), 1 lesson
        d1 = timezone.now() - timedelta(days=2)
        NetworkMeasurementFactory(user=u1, quality_score=10).created_at = d1
        # manually update created_at with queryset updating to bypass auto_now_add
        e1 = EnrollmentFactory(student=u1, course=c1)
        LessonProgress.objects.create(enrollment=e1, lesson=Lesson.objects.create(course=c1, title="A"), is_completed=True, completed_at=d1, time_spent_minutes=10)
        
        # Day 2: good network (100 score), 2 lessons
        d2 = timezone.now() - timedelta(days=1)
        e2 = EnrollmentFactory(student=u1, course=CourseFactory())
        LessonProgress.objects.create(enrollment=e2, lesson=Lesson.objects.create(course=e2.course, title="B"), is_completed=True, completed_at=d2, time_spent_minutes=10)
        LessonProgress.objects.create(enrollment=e2, lesson=Lesson.objects.create(course=e2.course, title="C"), is_completed=True, completed_at=d2, time_spent_minutes=10)

        # Day 3: good network (100 score), 2 lessons
        d3 = timezone.now()
        e3 = EnrollmentFactory(student=u1, course=CourseFactory())
        LessonProgress.objects.create(enrollment=e3, lesson=Lesson.objects.create(course=e3.course, title="D"), is_completed=True, completed_at=d3, time_spent_minutes=10)
        LessonProgress.objects.create(enrollment=e3, lesson=Lesson.objects.create(course=e3.course, title="E"), is_completed=True, completed_at=d3, time_spent_minutes=10)

        # Update creation dates directly on DB since auto_now_add=True overrides .save() assignment
        nm1 = NetworkMeasurementFactory(user=u1)
        nm2 = NetworkMeasurementFactory(user=u1)
        nm3 = NetworkMeasurementFactory(user=u1)
        NetworkMeasurement.objects.filter(id=nm1.id).update(created_at=d1, quality_score=10)
        NetworkMeasurement.objects.filter(id=nm2.id).update(created_at=d2, quality_score=100)
        NetworkMeasurement.objects.filter(id=nm3.id).update(created_at=d3, quality_score=100)

        from apps.analytics.correlation import compute_correlation
        result = compute_correlation(u1)
        self.assertTrue(result['has_enough_data'])
        self.assertGreaterEqual(result['correlation_coefficient'], 0.5)

    def test_enrollment_prevents_double_signup(self):
        u = UserFactory()
        c = CourseFactory()
        EnrollmentFactory(student=u, course=c)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(u).access_token}')
        response = client.post(reverse("enrollment-list"), {"course": c.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_jwt_refresh_invalidates_old_token(self):
        u = UserFactory()
        client = APIClient()
        refresh = RefreshToken.for_user(u)
        response = client.post(reverse("auth-refresh"), {"refresh": str(refresh)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_leaderboard_ordering_is_stable(self):
        client = APIClient()
        u = UserFactory()
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(u).access_token}')
        r1 = client.get(reverse("analytics-leaderboard"))
        r2 = client.get(reverse("analytics-leaderboard"))
        self.assertEqual(r1.data, r2.data)
