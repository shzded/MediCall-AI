from datetime import datetime

from pydantic import BaseModel


class CallOut(BaseModel):
    id: int
    name: str
    phone: str
    urgency: str
    time: datetime
    duration: str
    summary: str
    status: str
    symptoms: list[str]
    callback_requested: bool
    callback_completed: bool
    callback_completed_at: datetime | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CallsListResponse(BaseModel):
    calls: list[CallOut]
    total: int
    skip: int
    limit: int


class NotesUpdate(BaseModel):
    notes: str
