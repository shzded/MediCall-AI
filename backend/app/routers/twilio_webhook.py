"""Twilio webhook endpoints for incoming voice calls."""

import logging
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, Request
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session
from app.models.call import Call
from app.services import openai_service
from app.services.twilio_service import voice_twiml
from app.utils.deps import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/twilio", tags=["twilio"])


@router.post("/voice")
async def handle_voice(request: Request):
    base_url = str(request.base_url).rstrip("/")
    callback_url = f"{base_url}/api/twilio/recording-complete"
    twiml = voice_twiml(callback_url)
    return Response(content=twiml, media_type="application/xml")


@router.post("/recording-complete")
async def handle_recording_complete(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    form = await request.form()
    recording_url = str(form.get("RecordingUrl", ""))
    call_sid = str(form.get("CallSid", ""))
    caller = str(form.get("From", "Unbekannt"))
    duration = str(form.get("RecordingDuration", "0"))

    dur_secs = int(duration) if duration.isdigit() else 0
    dur_str = f"00:{dur_secs // 60:02d}:{dur_secs % 60:02d}"

    call = Call(
        name="Unbekannt",
        phone=caller,
        urgency="medium",
        time=datetime.now(timezone.utc),
        duration=dur_str,
        summary="Anruf wird verarbeitet…",
        status="unread",
        symptoms=[],
        callback_requested=False,
        twilio_call_sid=call_sid,
    )
    db.add(call)
    await db.commit()
    await db.refresh(call)

    if recording_url:
        background_tasks.add_task(_process_recording, call.id, recording_url)

    return {"status": "ok", "call_id": call.id}


async def _process_recording(call_id: int, recording_url: str):
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{recording_url}.wav")
            resp.raise_for_status()
            audio_bytes = resp.content

        transcript = await openai_service.transcribe_audio(audio_bytes)
        if not transcript:
            return

        analysis = await openai_service.analyze_transcript(transcript)
        if not analysis:
            return

        async with async_session() as db:
            call = await db.get(Call, call_id)
            if not call:
                return
            call.transcript = transcript
            call.name = analysis.get("name", "Unbekannt")
            call.summary = analysis.get("summary", "")
            call.symptoms = analysis.get("symptoms", [])
            call.urgency = analysis.get("urgency", "medium")
            call.callback_requested = analysis.get("callback_requested", False)
            call.updated_at = datetime.now(timezone.utc)
            await db.commit()
            logger.info("Processed recording for call %d", call_id)

    except Exception:
        logger.exception("Failed to process recording for call %d", call_id)
