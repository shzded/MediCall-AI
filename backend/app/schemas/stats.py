from pydantic import BaseModel


class StatsOut(BaseModel):
    today_calls: int
    urgent_calls: int
    avg_duration: str
    month_calls: int
    yesterday_calls: int
    unhandled_urgent: int
    avg_duration_yesterday: str
    urgent_percentage: float


class DailyStatsOut(BaseModel):
    date: str
    count: int


class UrgencyStatsOut(BaseModel):
    urgency: str
    count: int
    percentage: float


class SymptomStatOut(BaseModel):
    symptom: str
    count: int
