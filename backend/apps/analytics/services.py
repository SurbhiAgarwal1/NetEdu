"""
apps/analytics/services.py
──────────────────────────
This is where Pandas and Plotly live — the M-Lab skill showcase.
All heavy data processing lives here, NOT in views.
Views stay thin; services do the work. This is production architecture.
"""

import pandas as pd
import json
import math
from django.db.models import QuerySet
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count

User = get_user_model()


def queryset_to_dataframe(queryset: QuerySet, fields: list) -> pd.DataFrame:
    """Convert a Django QuerySet to a Pandas DataFrame."""
    data = list(queryset.values(*fields))
    if not data:
        return pd.DataFrame(columns=fields)
    return pd.DataFrame(data)


def get_network_analytics(user) -> dict:
    """
    Full network analytics for a user using Pandas.
    Returns aggregated stats, trend data, and quality distribution.
    """
    from apps.network.models import NetworkMeasurement

    qs = NetworkMeasurement.objects.filter(user=user).order_by("created_at")
    df = queryset_to_dataframe(qs, [
        "created_at", "download_speed", "upload_speed",
        "latency", "quality_score", "connection_type"
    ])

    if df.empty:
        return {"empty": True, "message": "No network measurements yet."}

    # Ensure datetime column is proper type
    df["created_at"] = pd.to_datetime(df["created_at"])
    df["date"] = df["created_at"].dt.date

    # ── Summary stats ──────────────────────────────────────────────────────
    std_download = float(df["download_speed"].std()) if len(df) > 1 else 0.0
    if math.isnan(std_download):
        std_download = 0.0

    summary = {
        "avg_download": round(df["download_speed"].mean(), 2),
        "avg_upload": round(df["upload_speed"].mean(), 2),
        "avg_latency": round(df["latency"].mean(), 2),
        "avg_quality": round(df["quality_score"].mean(), 2),
        "max_download": round(df["download_speed"].max(), 2),
        "min_download": round(df["download_speed"].min(), 2),
        "total_tests": len(df),
        "std_download": round(std_download, 2),  # stability metric
    }

    # ── Daily averages for trend chart ─────────────────────────────────────
    daily = (
        df.groupby("date")
        .agg(
            avg_download=("download_speed", "mean"),
            avg_upload=("upload_speed", "mean"),
            avg_latency=("latency", "mean"),
            tests=("download_speed", "count"),
        )
        .round(2)
        .reset_index()
    )
    daily["date"] = daily["date"].astype(str)
    trend_data = daily.to_dict(orient="records")

    # ── Quality score distribution (for histogram) ─────────────────────────
    bins = [0, 25, 50, 75, 90, 100]
    labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"]
    df["quality_band"] = pd.cut(df["quality_score"], bins=bins, labels=labels, include_lowest=True)
    quality_dist = df["quality_band"].value_counts().to_dict()
    # Convert to list for Recharts
    quality_dist_list = [
        {"band": band, "count": int(count)}
        for band, count in quality_dist.items()
    ]

    # ── Connection type breakdown ──────────────────────────────────────────
    conn_breakdown = (
        df["connection_type"].value_counts()
        .rename_axis("type")
        .reset_index(name="count")
        .to_dict(orient="records")
    )

    return {
        "empty": False,
        "summary": summary,
        "trend": trend_data,
        "quality_distribution": quality_dist_list,
        "connection_breakdown": conn_breakdown,
    }


def get_learning_analytics(user) -> dict:
    """Learning progress analytics using Pandas."""
    from apps.learning.models import Enrollment, LessonProgress

    enrollments = Enrollment.objects.filter(student=user).select_related("course")
    if not enrollments.exists():
        return {"empty": True, "message": "Not enrolled in any courses yet."}

    # Build enrollment summary
    enrollment_data = []
    for e in enrollments:
        enrollment_data.append({
            "course": e.course.title,
            "progress": e.progress_percentage,
            "is_completed": e.is_completed,
            "enrolled_at": e.enrolled_at,
        })

    df = pd.DataFrame(enrollment_data)

    # Lesson progress over time
    progress_qs = LessonProgress.objects.filter(
        enrollment__student=user,
        is_completed=True,
        completed_at__isnull=False,
    ).order_by("completed_at")

    if progress_qs.exists():
        prog_df = queryset_to_dataframe(progress_qs, ["completed_at", "time_spent_minutes"])
        prog_df["completed_at"] = pd.to_datetime(prog_df["completed_at"])
        prog_df["date"] = prog_df["completed_at"].dt.date

        daily_learning = (
            prog_df.groupby("date")
            .agg(
                lessons_done=("time_spent_minutes", "count"),
                minutes_spent=("time_spent_minutes", "sum"),
            )
            .reset_index()
        )
        daily_learning["date"] = daily_learning["date"].astype(str)
        activity_timeline = daily_learning.to_dict(orient="records")
    else:
        activity_timeline = []

    return {
        "empty": False,
        "summary": {
            "total_enrolled": len(enrollment_data),
            "completed_courses": int(df["is_completed"].sum()),
            "avg_progress": round(df["progress"].mean(), 1),
            "total_lessons_done": progress_qs.count(),
        },
        "course_progress": enrollment_data,
        "activity_timeline": activity_timeline,
    }


def get_combined_dashboard(user) -> dict:
    """Single endpoint that powers the full dashboard."""
    return {
        "network": get_network_analytics(user),
        "learning": get_learning_analytics(user),
    }


def _build_ranked_leaderboard_entries(current_user) -> list[dict]:
    """Compute and rank full leaderboard entries for all active users."""
    from apps.learning.models import Enrollment, LessonProgress, QuizAttempt
    from django.utils import timezone
    from datetime import timedelta

    users = list(User.objects.filter(is_active=True).values(
        "id", "first_name", "last_name", "avatar"
    ))
    if not users:
        return {"leaders": [], "total_users": 0}

    user_ids = [u["id"] for u in users]

    enroll_stats = {
        row["student"]: row["courses_completed"]
        for row in (
            Enrollment.objects.filter(student_id__in=user_ids, is_completed=True)
            .values("student")
            .annotate(courses_completed=Count("id"))
        )
    }
    lesson_stats = {
        row["enrollment__student"]: row["lessons_completed"]
        for row in (
            LessonProgress.objects.filter(
                enrollment__student_id__in=user_ids,
                is_completed=True,
            )
            .values("enrollment__student")
            .annotate(lessons_completed=Count("id"))
        )
    }
    quiz_stats = {
        row["student"]: round(float(row["avg_score"] or 0.0), 2)
        for row in (
            QuizAttempt.objects.filter(student_id__in=user_ids)
            .values("student")
            .annotate(avg_score=Avg("score"))
        )
    }

    # Pull recent completion dates and compute streak per user.
    recent_days = timezone.now() - timedelta(days=365)
    completion_rows = LessonProgress.objects.filter(
        enrollment__student_id__in=user_ids,
        is_completed=True,
        completed_at__isnull=False,
        completed_at__gte=recent_days,
    ).values_list("enrollment__student_id", "completed_at")

    completion_dates = {}
    for uid, completed_at in completion_rows:
        completion_dates.setdefault(uid, set()).add(completed_at.date())

    today = timezone.now().date()

    def calculate_streak(dates: set) -> int:
        streak = 0
        day = today
        while day in dates:
            streak += 1
            day -= timedelta(days=1)
        return streak

    entries = []
    for u in users:
        uid = u["id"]
        courses_completed = int(enroll_stats.get(uid, 0))
        lessons_completed = int(lesson_stats.get(uid, 0))
        avg_score = float(quiz_stats.get(uid, 0.0))
        streak = calculate_streak(completion_dates.get(uid, set()))
        points = int(lessons_completed * 10 + courses_completed * 120 + streak * 15 + avg_score * 2)

        full_name = f"{u['first_name']} {u['last_name']}".strip() or f"User {uid}"
        avatar_raw = (u.get("avatar") or "").strip()
        initials = "".join([part[0] for part in full_name.split()[:2] if part])[:2].upper() or "NA"
        avatar = initials if (not avatar_raw or avatar_raw.startswith("http")) else avatar_raw[:2].upper()

        entries.append({
            "user_id": uid,
            "name": full_name,
            "avatar": avatar,
            "courses_completed": courses_completed,
            "lessons_completed": lessons_completed,
            "avg_score": round(avg_score, 2),
            "streak": streak,
            "points": points,
        })

    ranked = sorted(entries, key=lambda e: (e["points"], e["lessons_completed"]), reverse=True)
    for idx, entry in enumerate(ranked, start=1):
        entry["rank"] = idx
        entry["is_current_user"] = entry["user_id"] == current_user.id

    return ranked


def get_leaderboard(current_user, limit: int = 20) -> dict:
    """Compute a real leaderboard from learning + quiz activity."""
    ranked = _build_ranked_leaderboard_entries(current_user)

    return {
        "leaders": ranked[:limit],
        "total_users": len(ranked),
    }


def get_my_leaderboard_position(current_user, window: int = 2) -> dict:
    """Return current user's rank card and nearby users for trust and context."""
    ranked = _build_ranked_leaderboard_entries(current_user)
    if not ranked:
        return {
            "found": False,
            "message": "No leaderboard data yet.",
            "rank": None,
            "total_users": 0,
            "percentile": None,
            "entry": None,
            "neighbors": [],
        }

    current_index = next(
        (idx for idx, entry in enumerate(ranked) if entry["user_id"] == current_user.id),
        None,
    )
    if current_index is None:
        return {
            "found": False,
            "message": "Current user not present in leaderboard.",
            "rank": None,
            "total_users": len(ranked),
            "percentile": None,
            "entry": None,
            "neighbors": [],
        }

    total_users = len(ranked)
    rank = current_index + 1
    percentile = round(((total_users - rank) / max(total_users - 1, 1)) * 100, 2)
    start = max(0, current_index - max(window, 0))
    end = min(total_users, current_index + max(window, 0) + 1)

    return {
        "found": True,
        "rank": rank,
        "total_users": total_users,
        "percentile": percentile,
        "entry": ranked[current_index],
        "neighbors": ranked[start:end],
    }
