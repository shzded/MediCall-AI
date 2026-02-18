from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.call import Call
from app.schemas.stats import DailyStatsOut, StatsOut, SymptomStatOut, UrgencyStatsOut
from app.services import pdf_service, stats_service
from app.utils.deps import get_db

router = APIRouter(tags=["stats"])


@router.get("/stats", response_model=StatsOut)
async def get_stats(db: AsyncSession = Depends(get_db)):
    return await stats_service.get_stats(db)


@router.get("/stats/daily", response_model=list[DailyStatsOut])
async def get_daily_stats(days: int = 7, db: AsyncSession = Depends(get_db)):
    return await stats_service.get_daily_stats(db, days=days)


@router.get("/stats/urgency", response_model=list[UrgencyStatsOut])
async def get_urgency_stats(db: AsyncSession = Depends(get_db)):
    return await stats_service.get_urgency_stats(db)


@router.get("/stats/symptoms", response_model=list[SymptomStatOut])
async def get_symptom_stats(limit: int = 10, db: AsyncSession = Depends(get_db)):
    return await stats_service.get_symptom_stats(db, limit=limit)


@router.get("/stats/export/pdf")
async def export_pdf(db: AsyncSession = Depends(get_db)):
    stats = await stats_service.get_stats(db)
    result = await db.execute(select(Call).order_by(Call.time.desc()).limit(50))
    calls = list(result.scalars().all())
    pdf_bytes = pdf_service.generate_report_pdf(calls, stats)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=medicall-report.pdf"},
    )
