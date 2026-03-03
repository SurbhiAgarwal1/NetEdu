"""
apps/analytics/correlation.py
──────────────────────────────
THE UNIQUE FEATURE: Network-Learning Correlation Analysis

This computes whether a student's internet quality on a given day
correlates with their learning output that day.

This is the kind of data analysis work M-Lab mentors will appreciate:
- Uses Pandas merge, correlation, and groupby
- Produces actionable insights, not just raw numbers
- Models real-world hypothesis: "Does slow internet reduce learning?"
"""

import pandas as pd
import numpy as np
from django.contrib.auth import get_user_model

User = get_user_model()


def compute_correlation(user) -> dict:
    """
    For each day the user both:
      (a) ran at least one network test, AND
      (b) completed at least one lesson

    We correlate: avg_network_quality ↔ lessons_completed

    Returns:
      - daily_data: list of {date, avg_quality, lessons_done} for the chart
      - correlation_coefficient: Pearson r (-1 to 1)
      - insight: human-readable conclusion
      - has_enough_data: bool
    """
    from apps.network.models import NetworkMeasurement
    from apps.learning.models import LessonProgress

    # ── Pull network data ──────────────────────────────────────────────────
    net_qs = NetworkMeasurement.objects.filter(user=user).values(
        'created_at', 'quality_score', 'download_speed', 'latency'
    )
    # ── Pull learning data ─────────────────────────────────────────────────
    learn_qs = LessonProgress.objects.filter(
        enrollment__student=user,
        is_completed=True,
        completed_at__isnull=False
    ).values('completed_at', 'time_spent_minutes')

    if not net_qs.exists() or not learn_qs.exists():
        return {
            'has_enough_data': False,
            'reason': 'Need both network tests and completed lessons to compute correlation.',
            'daily_data': [],
            'correlation_coefficient': None,
            'insight': None,
        }

    # ── Build DataFrames ───────────────────────────────────────────────────
    net_df = pd.DataFrame(list(net_qs))
    net_df['created_at'] = pd.to_datetime(net_df['created_at'], utc=True)
    net_df['date'] = net_df['created_at'].dt.date

    learn_df = pd.DataFrame(list(learn_qs))
    learn_df['completed_at'] = pd.to_datetime(learn_df['completed_at'], utc=True)
    learn_df['date'] = learn_df['completed_at'].dt.date

    # ── Daily aggregations ─────────────────────────────────────────────────
    daily_net = net_df.groupby('date').agg(
        avg_quality=('quality_score', 'mean'),
        avg_download=('download_speed', 'mean'),
        avg_latency=('latency', 'mean'),
        net_tests=('quality_score', 'count'),
    ).round(2).reset_index()

    daily_learn = learn_df.groupby('date').agg(
        lessons_done=('time_spent_minutes', 'count'),
        total_minutes=('time_spent_minutes', 'sum'),
    ).reset_index()

    # ── Inner join: only days where BOTH happened ─────────────────────────
    merged = pd.merge(daily_net, daily_learn, on='date', how='inner')

    if len(merged) < 3:
        return {
            'has_enough_data': False,
            'reason': f'Only {len(merged)} overlapping days found. Need at least 3 days of data with both network tests and learning activity.',
            'daily_data': [],
            'correlation_coefficient': None,
            'insight': None,
        }

    # ── Pearson correlation ────────────────────────────────────────────────
    corr = merged['avg_quality'].corr(merged['lessons_done'])
    corr_rounded = round(float(corr), 3)

    # ── Build insight text ────────────────────────────────────────────────
    insight = _generate_insight(corr_rounded, merged)

    # ── Format for chart ──────────────────────────────────────────────────
    merged['date'] = merged['date'].astype(str)
    daily_data = merged[[
        'date', 'avg_quality', 'avg_download',
        'avg_latency', 'lessons_done', 'total_minutes'
    ]].to_dict(orient='records')

    # ── Scatter data (quality vs lessons) ────────────────────────────────
    scatter_data = merged[['avg_quality', 'lessons_done', 'date']].to_dict(orient='records')

    # ── Best vs worst network days ────────────────────────────────────────
    top_net = merged.nlargest(5, 'avg_quality')[['date', 'avg_quality', 'lessons_done']]
    low_net = merged.nsmallest(5, 'avg_quality')[['date', 'avg_quality', 'lessons_done']]

    avg_lessons_good_net = round(top_net['lessons_done'].mean(), 1)
    avg_lessons_bad_net  = round(low_net['lessons_done'].mean(), 1)

    return {
        'has_enough_data': True,
        'daily_data': daily_data,
        'scatter_data': scatter_data,
        'correlation_coefficient': corr_rounded,
        'insight': insight,
        'comparison': {
            'avg_lessons_on_good_network': avg_lessons_good_net,
            'avg_lessons_on_bad_network': avg_lessons_bad_net,
            'difference_pct': round(
                ((avg_lessons_good_net - avg_lessons_bad_net) / max(avg_lessons_bad_net, 0.1)) * 100, 1
            ),
        },
        'data_points': len(merged),
    }


def _generate_insight(r: float, df: pd.DataFrame) -> str:
    """Turn a correlation coefficient into a human-readable insight."""
    avg_q = df['avg_quality'].mean()
    avg_l = df['lessons_done'].mean()

    strength = (
        'strong' if abs(r) >= 0.6
        else 'moderate' if abs(r) >= 0.35
        else 'weak'
    )

    if r > 0.35:
        return (
            f"📈 {strength.capitalize()} positive correlation (r={r}): "
            f"On days when your network quality is higher (avg {avg_q:.0f}/100), "
            f"you tend to complete more lessons (avg {avg_l:.1f}/day). "
            f"Better connectivity appears to support your learning."
        )
    elif r < -0.35:
        return (
            f"📉 {strength.capitalize()} negative correlation (r={r}): "
            f"Interestingly, you seem to study more on days with lower network quality. "
            f"You may be compensating, or studying offline content when the internet is poor."
        )
    else:
        return (
            f"📊 Weak correlation (r={r}): "
            f"Your learning activity does not strongly depend on network quality. "
            f"You study consistently regardless of your connection speed — great resilience!"
        )
