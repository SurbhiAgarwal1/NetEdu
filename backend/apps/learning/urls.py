from django.urls import path
from . import views

urlpatterns = [
    path("courses/", views.CourseListCreateView.as_view(), name="course-list"),
    path("courses/<int:pk>/", views.CourseDetailView.as_view(), name="course-detail"),
    path("enrollments/", views.EnrollmentListCreateView.as_view(), name="enrollment-list"),
    path("enrollments/<int:enrollment_id>/progress/", views.LessonProgressView.as_view(), name="lesson-progress"),
    path("enrollments/<int:enrollment_id>/lessons/<int:lesson_id>/complete/", views.mark_lesson_complete, name="lesson-complete"),
    path("quiz-attempts/", views.QuizAttemptCreateView.as_view(), name="quiz-attempt-create"),
    path("my-attempts/", views.MyQuizAttemptsView.as_view(), name="my-quiz-attempts"),
]
