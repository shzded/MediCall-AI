from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.call import CallOut, CallsListResponse, NotesUpdate
from app.services import call_service
from app.utils.deps import get_db

router = APIRouter(tags=["calls"])


@router.get("/calls", response_model=CallsListResponse)
async def list_calls(
    search: str | None = None,
    status: str | None = None,
    urgency: str | None = None,
    skip: int = 0,
    limit: int = 10,
    sort: str | None = None,
    order: str = "desc",
    db: AsyncSession = Depends(get_db),
):
    calls, total = await call_service.get_calls(
        db, search=search, status=status, urgency=urgency,
        skip=skip, limit=limit, sort=sort, order=order,
    )
    return CallsListResponse(
        calls=[CallOut.model_validate(c) for c in calls],
        total=total, skip=skip, limit=limit,
    )


@router.get("/calls/{call_id}", response_model=CallOut)
async def get_call(call_id: int, db: AsyncSession = Depends(get_db)):
    call = await call_service.get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return CallOut.model_validate(call)


@router.patch("/calls/{call_id}/status", response_model=CallOut)
async def toggle_call_status(call_id: int, db: AsyncSession = Depends(get_db)):
    call = await call_service.get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    call = await call_service.toggle_status(db, call)
    return CallOut.model_validate(call)


@router.patch("/calls/{call_id}/notes", response_model=CallOut)
async def update_call_notes(
    call_id: int, body: NotesUpdate, db: AsyncSession = Depends(get_db),
):
    call = await call_service.get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    call = await call_service.update_notes(db, call, body.notes)
    return CallOut.model_validate(call)


@router.patch("/calls/{call_id}/callback", response_model=CallOut)
async def mark_callback(call_id: int, db: AsyncSession = Depends(get_db)):
    call = await call_service.get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    call = await call_service.mark_callback_completed(db, call)
    return CallOut.model_validate(call)


@router.delete("/calls/{call_id}", status_code=204)
async def delete_call(call_id: int, db: AsyncSession = Depends(get_db)):
    call = await call_service.get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    await call_service.delete_call(db, call)
