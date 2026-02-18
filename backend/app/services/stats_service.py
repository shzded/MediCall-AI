from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy import Integer, cast, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.call import Call


def _start_of_day(d: date) -> datetime:
    return datetime.combine(d, time.min, tzinfo=timezone.utc)


def _end_of_day(d: date) -> datetime:
    return datetime.combine(d, time.max, tzinfo=timezone.utc)


def _parse_duration_seconds(dur: str) -> int:
    parts = dur.split(":")
    if len(parts) == 3:
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
    return 0


def _format_duration(total_seconds: int) -> str:
    h = total_seconds // 3600
    m = (total_seconds % 3600) // 60
    s = total_seconds % 60
    return f"{h:02d}:{m:02d}:{s:02d}"


async def get_stats(db: AsyncSession) -> dict:
    today = date.today()
    yesterday = today - timedelta(days=1)
    month_start = today.replace(day=1)

    today_start = _start_of_day(today)
    today_end = _end_of_day(today)
    yesterday_start = _start_of_day(yesterday)
    yesterday_end = _end_of_day(yesterday)
    month_start_dt = _start_of_day(month_start)

    # Today calls
    today_calls = await db.scalar(
        select(func.count(Call.id)).where(Call.time.between(today_start, today_end))
    ) or 0

    # Urgent calls today
    urgent_calls = await db.scalar(
        select(func.count(Call.id)).where(
            Call.time.between(today_start, today_end), Call.urgency == "high"
        )
    ) or 0

    # Yesterday calls
    yesterday_calls = await db.scalar(
        select(func.count(Call.id)).where(Call.time.between(yesterday_start, yesterday_end))
    ) or 0

    # Month calls
    month_calls = await db.scalar(
        select(func.count(Call.id)).where(Call.time >= month_start_dt)
    ) or 0

    # Unhandled urgent (high urgency + unread)
    unhandled_urgent = await db.scalar(
        select(func.count(Call.id)).where(Call.urgency == "high", Call.status == "unread")
    ) or 0

    # Total calls for urgent percentage
    total_calls = await db.scalar(select(func.count(Call.id))) or 0
    total_urgent = await db.scalar(
        select(func.count(Call.id)).where(Call.urgency == "high")
    ) or 0
    urgent_percentage = round((total_urgent / total_calls * 100) if total_calls > 0 else 0, 1)

    # Average duration today
    today_durations = await db.execute(
        select(Call.duration).where(Call.time.between(today_start, today_end))
    )
    today_durs = [row[0] for row in today_durations]
    if today_durs:
        avg_secs = sum(_parse_duration_seconds(d) for d in today_durs) // len(today_durs)
        avg_duration = _format_duration(avg_secs)
    else:
        avg_duration = "00:00:00"

    # Average duration yesterday
    yesterday_durations = await db.execute(
        select(Call.duration).where(Call.time.between(yesterday_start, yesterday_end))
    )
    yesterday_durs = [row[0] for row in yesterday_durations]
    if yesterday_durs:
        avg_secs_y = sum(_parse_duration_seconds(d) for d in yesterday_durs) // len(yesterday_durs)
        avg_duration_yesterday = _format_duration(avg_secs_y)
    else:
        avg_duration_yesterday = "00:00:00"

    return {
        "today_calls": today_calls,
        "urgent_calls": urgent_calls,
        "avg_duration": avg_duration,
        "month_calls": month_calls,
        "yesterday_calls": yesterday_calls,
        "unhandled_urgent": unhandled_urgent,
        "avg_duration_yesterday": avg_duration_yesterday,
        "urgent_percentage": urgent_percentage,
    }


async def get_daily_stats(db: AsyncSession, days: int = 7) -> list[dict]:
    today = date.today()
    start_date = today - timedelta(days=days - 1)
    start_dt = _start_of_day(start_date)

    result = await db.execute(
        select(
            func.date(Call.time).label("day"),
            func.count(Call.id).label("count"),
        )
        .where(Call.time >= start_dt)
        .group_by(func.date(Call.time))
        .order_by(func.date(Call.time))
    )
    rows = {str(row.day): row.count for row in result}

    daily = []
    for i in range(days):
        d = start_date + timedelta(days=i)
        daily.append({"date": str(d), "count": rows.get(str(d), 0)})
    return daily


async def get_urgency_stats(db: AsyncSession) -> list[dict]:
    total = await db.scalar(select(func.count(Call.id))) or 0
    result = await db.execute(
        select(Call.urgency, func.count(Call.id).label("count"))
        .group_by(Call.urgency)
    )
    stats = []
    for row in result:
        pct = round((row.count / total * 100) if total > 0 else 0, 1)
        stats.append({"urgency": row.urgency, "count": row.count, "percentage": pct})

    # Ensure all urgency levels are present
    present = {s["urgency"] for s in stats}
    for u in ("high", "medium", "low"):
        if u not in present:
            stats.append({"urgency": u, "count": 0, "percentage": 0})

    order = {"high": 0, "medium": 1, "low": 2}
    stats.sort(key=lambda x: order.get(x["urgency"], 99))
    return stats


async def get_symptom_stats(db: AsyncSession, limit: int = 10) -> list[dict]:
    result = await db.execute(
        text(
            "SELECT s AS symptom, COUNT(*) AS count "
            "FROM calls, unnest(symptoms) AS s "
            "GROUP BY s ORDER BY count DESC LIMIT :lim"
        ).bindparams(lim=limit)
    )
    return [{"symptom": row.symptom, "count": row.count} for row in result]
