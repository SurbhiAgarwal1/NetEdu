from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Course, Lesson, Enrollment, LessonProgress, QuizAttempt
from .serializers import (
    CourseListSerializer, CourseDetailSerializer,
    EnrollmentSerializer, LessonProgressSerializer, QuizAttemptSerializer
)


class IsTeacherOrAdmin(permissions.BasePermission):
    """Custom permission — only teachers/admins can create courses."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:  # GET, HEAD, OPTIONS always allowed
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role in ["teacher", "admin"]


class CourseListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/learning/courses/       → list all published courses
    POST /api/learning/courses/       → create course (teachers only)
    """
    permission_classes = [IsTeacherOrAdmin]
    search_fields = ["title", "description", "tags"]
    filterset_fields = ["difficulty", "is_published"]
    ordering_fields = ["created_at", "title"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CourseDetailSerializer
        return CourseListSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ["teacher", "admin"]:
            return Course.objects.filter(instructor=user)
        return Course.objects.filter(is_published=True)


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/learning/courses/<id>/"""
    serializer_class = CourseDetailSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Course.objects.all()
        if user.role == "teacher":
            return Course.objects.filter(instructor=user)
        return Course.objects.filter(is_published=True)


class EnrollmentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/learning/enrollments/  → my enrolled courses
    POST /api/learning/enrollments/  → enroll in a course
    """
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user).select_related("course")


class LessonProgressView(generics.ListAPIView):
    """GET /api/learning/enrollments/<enrollment_id>/progress/"""
    serializer_class = LessonProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LessonProgress.objects.filter(
            enrollment__id=self.kwargs["enrollment_id"],
            enrollment__student=self.request.user
        )


@api_view(["PATCH"])
@permission_classes([permissions.IsAuthenticated])
def mark_lesson_complete(request, enrollment_id, lesson_id):
    """
    PATCH /api/learning/enrollments/<enrollment_id>/lessons/<lesson_id>/complete/
    Marks a lesson as done. Creates progress record if doesn't exist.
    """
    enrollment = get_object_or_404(
        Enrollment, id=enrollment_id, student=request.user
    )
    progress, created = LessonProgress.objects.get_or_create(
        enrollment=enrollment,
        lesson_id=lesson_id
    )
    serializer = LessonProgressSerializer(
        progress, data=request.data, partial=True, context={"request": request}
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


class QuizAttemptCreateView(generics.CreateAPIView):
    """POST /api/learning/quiz-attempts/ — submit a quiz"""
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]


class MyQuizAttemptsView(generics.ListAPIView):
    """GET /api/learning/quiz-attempts/ — my quiz history"""
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return QuizAttempt.objects.filter(student=self.request.user)
