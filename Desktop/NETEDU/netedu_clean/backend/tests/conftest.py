import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from .factories import (
    UserFactory, TeacherFactory, AdminFactory,
    NetworkMeasurementFactory, CourseFactory, EnrollmentFactory,
    LowQualityNetworkFactory, HighQualityNetworkFactory
)
from apps.learning.models import Lesson, LessonProgress

@pytest.fixture
def student_user(db):
    return UserFactory()

@pytest.fixture
def teacher_user(db):
    return TeacherFactory()

@pytest.fixture
def admin_user(db):
    return AdminFactory()

@pytest.fixture
def auth_client(db, student_user):
    client = APIClient()
    refresh = RefreshToken.for_user(student_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    client.user = student_user  # attach for convenience
    return client

@pytest.fixture
def admin_auth_client(db, admin_user):
    client = APIClient()
    refresh = RefreshToken.for_user(admin_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    client.user = admin_user
    return client

@pytest.fixture
def sample_course(db, teacher_user):
    return CourseFactory(instructor=teacher_user)

@pytest.fixture
def sample_measurement(db, student_user):
    return NetworkMeasurementFactory(user=student_user)

@pytest.fixture
def poor_network_student(db):
    user = UserFactory()
    for _ in range(10):
        LowQualityNetworkFactory(user=user)
    return user

@pytest.fixture
def rich_network_student(db):
    user = UserFactory()
    for _ in range(10):
        HighQualityNetworkFactory(user=user)
    return user

@pytest.fixture
def populated_leaderboard(db):
    users = []
    
    for i in range(5):
        u = UserFactory()
        NetworkMeasurementFactory(
            user=u,
            download_speed=10.0 * (i+1),
            upload_speed=5.0 * (i+1),
            latency=50.0 / (i+1)
        )
        
        for _ in range(i+1):
            course = CourseFactory()
            enrollment = EnrollmentFactory(student=u, course=course)
            lesson1 = Lesson.objects.create(course=course, title=f"L1 {course.id}", content="X", order=1)
            lesson2 = Lesson.objects.create(course=course, title=f"L2 {course.id}", content="X", order=2)
            LessonProgress.objects.create(enrollment=enrollment, lesson=lesson1, is_completed=True, time_spent_minutes=15)
            if i > 2:
                LessonProgress.objects.create(enrollment=enrollment, lesson=lesson2, is_completed=True, time_spent_minutes=20)
                
        users.append(u)
    
    return users
