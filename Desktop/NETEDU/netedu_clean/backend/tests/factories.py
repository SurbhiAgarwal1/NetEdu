import factory
from factory.django import DjangoModelFactory
from apps.users.models import User
from apps.network.models import NetworkMeasurement
from apps.learning.models import Course, Enrollment

class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Faker('email')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    role = User.Role.STUDENT
    is_active = True
    
    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        self.set_password(extracted or 'password123')

class TeacherFactory(UserFactory):
    role = User.Role.TEACHER

class AdminFactory(UserFactory):
    role = User.Role.ADMIN
    is_staff = True

class NetworkMeasurementFactory(DjangoModelFactory):
    class Meta:
        model = NetworkMeasurement

    user = factory.SubFactory(UserFactory)
    download_speed = factory.Faker('pyfloat', min_value=10.0, max_value=100.0)
    upload_speed = factory.Faker('pyfloat', min_value=5.0, max_value=50.0)
    latency = factory.Faker('pyfloat', min_value=5.0, max_value=100.0)
    jitter = factory.Faker('pyfloat', min_value=1.0, max_value=20.0)
    packet_loss = factory.Faker('pyfloat', min_value=0.0, max_value=5.0)

class CourseFactory(DjangoModelFactory):
    class Meta:
        model = Course

    title = factory.Faker('sentence', nb_words=4)
    description = factory.Faker('text')
    instructor = factory.SubFactory(TeacherFactory)
    is_published = True

class EnrollmentFactory(DjangoModelFactory):
    class Meta:
        model = Enrollment
        django_get_or_create = ('student', 'course')

    student = factory.SubFactory(UserFactory)
    course = factory.SubFactory(CourseFactory)

class LowQualityNetworkFactory(NetworkMeasurementFactory):
    download_speed = 1.0
    latency = 500.0
    packet_loss = 20.0

class HighQualityNetworkFactory(NetworkMeasurementFactory):
    download_speed = 100.0
    latency = 5.0
    packet_loss = 0.0
