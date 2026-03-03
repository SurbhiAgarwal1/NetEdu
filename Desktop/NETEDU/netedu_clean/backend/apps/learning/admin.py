from django.contrib import admin
from .models import Course, Lesson, Enrollment, LessonProgress, Quiz, QuizQuestion, QuizAttempt


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    fields = ["title", "content_type", "order", "duration_minutes", "is_free_preview"]


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["title", "instructor", "difficulty", "total_lessons", "enrolled_count", "is_published"]
    list_filter = ["difficulty", "is_published"]
    search_fields = ["title", "instructor__email"]
    inlines = [LessonInline]


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ["student", "course", "enrolled_at", "is_completed", "progress_percentage"]
    list_filter = ["is_completed"]


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ["student", "quiz", "score", "passed", "attempted_at"]
    list_filter = ["passed"]
