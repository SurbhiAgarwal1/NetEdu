from rest_framework import serializers
from django.utils import timezone
from .models import Course, Lesson, Enrollment, LessonProgress, Quiz, QuizQuestion, QuizAttempt


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            "id", "title", "content", "content_type", "order",
            "duration_minutes", "video_url", "is_free_preview", "created_at"
        ]


class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing courses (no lessons included)."""
    instructor_name = serializers.CharField(source="instructor.full_name", read_only=True)
    total_lessons = serializers.ReadOnlyField()
    enrolled_count = serializers.ReadOnlyField()

    class Meta:
        model = Course
        fields = [
            "id", "title", "description", "instructor_name", "difficulty",
            "tags", "thumbnail", "total_lessons", "enrolled_count",
            "is_published", "created_at"
        ]


class CourseDetailSerializer(serializers.ModelSerializer):
    """Full serializer with nested lessons."""
    instructor_name = serializers.CharField(source="instructor.full_name", read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)
    total_lessons = serializers.ReadOnlyField()
    enrolled_count = serializers.ReadOnlyField()

    class Meta:
        model = Course
        fields = [
            "id", "title", "description", "instructor_name", "difficulty",
            "tags", "thumbnail", "total_lessons", "enrolled_count",
            "lessons", "is_published", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["instructor"] = self.context["request"].user
        return super().create(validated_data)


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Enrollment
        fields = [
            "id", "course", "course_title", "enrolled_at",
            "is_completed", "completed_at", "progress_percentage"
        ]
        read_only_fields = ["id", "enrolled_at", "is_completed", "completed_at"]

    def create(self, validated_data):
        validated_data["student"] = self.context["request"].user
        return super().create(validated_data)


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source="lesson.title", read_only=True)

    class Meta:
        model = LessonProgress
        fields = [
            "id", "lesson", "lesson_title", "is_completed",
            "completed_at", "time_spent_minutes", "notes"
        ]
        read_only_fields = ["id", "completed_at"]

    def update(self, instance, validated_data):
        # Auto-set completed_at when marking complete
        if validated_data.get("is_completed") and not instance.is_completed:
            validated_data["completed_at"] = timezone.now()
        return super().update(instance, validated_data)


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ["id", "question_text", "option_a", "option_b", "option_c", "option_d", "order"]
        # Note: correct_option intentionally excluded from student-facing serializer


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ["id", "quiz", "score", "passed", "answers", "attempted_at"]
        read_only_fields = ["id", "score", "passed", "attempted_at"]

    def create(self, validated_data):
        validated_data["student"] = self.context["request"].user
        quiz = validated_data["quiz"]
        answers = validated_data.get("answers", {})

        # Grade the quiz
        questions = quiz.questions.all()
        correct = sum(
            1 for q in questions
            if str(answers.get(str(q.id), "")).lower() == q.correct_option.lower()
        )
        score = (correct / questions.count() * 100) if questions.count() > 0 else 0
        validated_data["score"] = round(score, 2)
        validated_data["passed"] = score >= quiz.passing_score

        return super().create(validated_data)
