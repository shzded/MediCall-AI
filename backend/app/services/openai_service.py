"""OpenAI integration for call transcript analysis.

Requires OPENAI_API_KEY to be set. Gracefully skips if not configured.
"""

import json
import logging

from openai import AsyncOpenAI

from app.config import settings

logger = logging.getLogger(__name__)

ANALYSIS_SYSTEM_PROMPT = """\
Du bist ein medizinischer Anruf-Analyse-Assistent für eine österreichische Arztpraxis.
Analysiere das folgende Transkript eines Patientenanrufs und extrahiere die folgenden Informationen.

Antworte ausschließlich im JSON-Format mit genau diesen Feldern:
{
  "name": "Name des Patienten (falls im Gespräch erwähnt, sonst 'Unbekannt')",
  "summary": "Zusammenfassung des Anliegens in 2-3 Sätzen auf Deutsch",
  "symptoms": ["Liste", "der", "Symptome", "auf Deutsch"],
  "urgency": "high/medium/low",
  "callback_requested": true/false
}

Dringlichkeitsstufen:
- high: Lebensbedrohliche Symptome (Brustschmerzen, Atemnot, starke Blutung, Bewusstlosigkeit, schwere allergische Reaktion)
- medium: Behandlungsbedürftige Symptome (Fieber >38°C, anhaltende Schmerzen, Infektionszeichen)
- low: Routineanfragen (Rezeptverlängerung, Terminanfrage, Befundabfrage)
"""


def _get_client() -> AsyncOpenAI | None:
    if not settings.openai_api_key:
        return None
    return AsyncOpenAI(api_key=settings.openai_api_key)


async def transcribe_audio(audio_bytes: bytes, filename: str = "recording.wav") -> str | None:
    client = _get_client()
    if not client:
        logger.warning("OpenAI API key not configured — skipping transcription")
        return None

    response = await client.audio.transcriptions.create(
        model="whisper-1",
        file=(filename, audio_bytes),
        language="de",
    )
    return response.text


async def analyze_transcript(transcript: str) -> dict | None:
    client = _get_client()
    if not client:
        logger.warning("OpenAI API key not configured — skipping analysis")
        return None

    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
            {"role": "user", "content": transcript},
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
    )

    content = response.choices[0].message.content
    if not content:
        return None

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        logger.error("Failed to parse OpenAI response as JSON: %s", content)
        return None
