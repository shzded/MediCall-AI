from datetime import datetime, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.call import Call


async def get_calls(
    db: AsyncSession,
    *,
    search: str | None = None,
    status: str | None = None,
    urgency: str | None = None,
    skip: int = 0,
    limit: int = 10,
    sort: str | None = None,
    order: str = "desc",
) -> tuple[list[Call], int]:
    query = select(Call)
    count_query = select(func.count(Call.id))

    if search:
        pattern = f"%{search}%"
        search_filter = or_(Call.name.ilike(pattern), Call.phone.ilike(pattern))
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    if status:
        query = query.where(Call.status == status)
        count_query = count_query.where(Call.status == status)

    if urgency:
        query = query.where(Call.urgency == urgency)
        count_query = count_query.where(Call.urgency == urgency)

    total = await db.scalar(count_query) or 0

    sort_column = getattr(Call, sort, None) if sort else None
    if sort_column is None:
        sort_column = Call.time
    query = query.order_by(sort_column.asc() if order == "asc" else sort_column.desc())

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    calls = list(result.scalars().all())
    return calls, total


async def get_call(db: AsyncSession, call_id: int) -> Call | None:
    return await db.get(Call, call_id)


async def toggle_status(db: AsyncSession, call: Call) -> Call:
    call.status = "read" if call.status == "unread" else "unread"
    call.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(call)
    return call


async def update_notes(db: AsyncSession, call: Call, notes: str) -> Call:
    call.notes = notes
    call.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(call)
    return call


async def mark_callback_completed(db: AsyncSession, call: Call) -> Call:
    call.callback_completed = True
    call.callback_completed_at = datetime.now(timezone.utc)
    call.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(call)
    return call


async def delete_call(db: AsyncSession, call: Call) -> None:
    await db.delete(call)
    await db.commit()
