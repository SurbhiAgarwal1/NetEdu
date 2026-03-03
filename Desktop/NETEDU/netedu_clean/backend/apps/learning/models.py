from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Course(models.Model):
    """A course created by a teacher."""

    class DifficultyLevel(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"

    title = models.CharField(max_length=300)
    description = models.TextField()
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="courses_taught")
    thumbnail = models.CharField(max_length=500, blank=True, default="", help_text="URL to thumbnail image")
    difficulty = models.CharField(max_length=20, choices=DifficultyLevel.choices, default=DifficultyLevel.BEGINNER)
    tags = models.JSONField(default=list, blank=True)  # e.g. ["python", "beginner"]
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "courses"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def total_lessons(self):
        return self.lessons.count()

    @property
    def enrolled_count(self):
        return self.enrollments.count()


class Lesson(models.Model):
    """A single lesson inside a course."""

    class ContentType(models.TextChoices):
        VIDEO = "video", "Video"
        ARTICLE = "article", "Article"
        QUIZ = "quiz", "Quiz"
        EXERCISE = "exercise", "Exercise"

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=300)
    content = models.TextField()
    content_type = models.CharField(max_length=20, choices=ContentType.choices, default=ContentType.ARTICLE)
    order = models.PositiveIntegerField(default=0)  # lesson ordering within course
    duration_minutes = models.PositiveIntegerField(default=10)
    video_url = models.URLField(blank=True, default="")
    is_free_preview = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "lessons"
        ordering = ["order"]
        unique_together = [["course", "order"]]

    def __str__(self):
        return f"{self.course.title} — Lesson {self.order}: {self.title}"


class Enrollment(models.Model):
    """Tracks which student is enrolled in which course."""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        db_table = "enrollments"
        unique_together = [["student", "course"]]  # can't enroll twice

    def __str__(self):
        return f"{self.student.email} → {self.course.title}"

    @property
    def progress_percentage(self):
        total = self.course.total_lessons
        if total == 0:
            return 0
        completed = LessonProgress.objects.filter(
            enrollment=self, is_completed=True
        ).count()
        return round((completed / total) * 100, 1)


class LessonProgress(models.Model):
    """Tracks individual lesson completion per student."""
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name="lesson_progress")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_spent_minutes = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, default="")  # student's personal notes

    class Meta:
        db_table = "lesson_progress"
        unique_together = [["enrollment", "lesson"]]

    def __str__(self):
        status = "✓" if self.is_completed else "○"
        return f"{status} {self.enrollment.student.email} — {self.lesson.title}"


class Quiz(models.Model):
    """Quiz attached to a lesson."""
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name="quiz")
    passing_score = models.PositiveIntegerField(default=70)  # percentage needed to pass

    class Meta:
        db_table = "quizzes"


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    question_text = models.TextField()
    option_a = models.CharField(max_length=500)
    option_b = models.CharField(max_length=500)
    option_c = models.CharField(max_length=500)
    option_d = models.CharField(max_length=500)
    correct_option = models.CharField(max_length=1, choices=[("a","A"),("b","B"),("c","C"),("d","D")])
    explanation = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "quiz_questions"
        ordering = ["order"]


class QuizAttempt(models.Model):
    """Records a student's quiz attempt."""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="quiz_attempts")
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="attempts")
    score = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    passed = models.BooleanField(default=False)
    answers = models.JSONField(default=dict)  # {"question_id": "a", ...}
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "quiz_attempts"
        ordering = ["-attempted_at"]
