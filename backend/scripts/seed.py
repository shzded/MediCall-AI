"""Seed the database with mock data matching the frontend mock data."""

import asyncio
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session, engine
from app.models.call import Base, Call


def _dt(day_offset: int, time_str: str) -> datetime:
    d = date.today() - timedelta(days=day_offset)
    t = datetime.strptime(time_str, "%H:%M:%S").time()
    return datetime.combine(d, t, tzinfo=timezone.utc)


SEED_CALLS = [
    {
        "name": "Maria Huber",
        "phone": "+43 660 1234567",
        "urgency": "high",
        "time": _dt(0, "09:15:00"),
        "duration": "00:04:32",
        "summary": "Patientin berichtet über starke Brustschmerzen seit heute Morgen, Ausstrahlung in den linken Arm. Keine Vorgeschichte von Herzproblemen. Empfehlung: Sofortige ärztliche Untersuchung.",
        "status": "unread",
        "symptoms": ["Brustschmerzen", "Armschmerzen", "Atemnot"],
        "callback_requested": True,
        "callback_completed": False,
        "notes": None,
    },
    {
        "name": "Thomas Gruber",
        "phone": "+43 664 9876543",
        "urgency": "medium",
        "time": _dt(0, "10:30:00"),
        "duration": "00:03:15",
        "summary": "Patient hat seit drei Tagen anhaltenden Husten mit gelblichem Auswurf und leichtem Fieber (38.2°C). Kein Kontakt mit COVID-positiven Personen bekannt.",
        "status": "unread",
        "symptoms": ["Husten", "Fieber", "Auswurf"],
        "callback_requested": False,
        "callback_completed": False,
        "notes": "Termin für morgen vereinbaren",
    },
    {
        "name": "Anna Steiner",
        "phone": "+43 676 5551234",
        "urgency": "low",
        "time": _dt(0, "11:00:00"),
        "duration": "00:02:45",
        "summary": "Patientin benötigt Verlängerung ihres Blutdruckmedikaments. Letzte Kontrolle vor 4 Monaten, Werte waren stabil. Bittet um Rezepterneuerung.",
        "status": "read",
        "symptoms": ["Rezeptanfrage", "Bluthochdruck"],
        "callback_requested": False,
        "callback_completed": False,
        "notes": "Rezept für Amlodipin 5mg ausgestellt",
    },
    {
        "name": "Klaus Berger",
        "phone": "+43 699 3334455",
        "urgency": "high",
        "time": _dt(0, "08:45:00"),
        "duration": "00:05:10",
        "summary": "Patient berichtet über plötzlich auftretenden starken Schwindel und Übelkeit. Kann kaum aufstehen. Blutdruck laut eigenem Messgerät 180/100. Vorgeschichte: Hypertonie.",
        "status": "unread",
        "symptoms": ["Schwindel", "Übelkeit", "Hoher Blutdruck"],
        "callback_requested": True,
        "callback_completed": True,
        "callback_completed_at": _dt(0, "09:30:00"),
        "notes": "Hausbesuch durchgeführt. Blutdruck stabilisiert.",
    },
    {
        "name": "Elisabeth Pichler",
        "phone": "+43 650 7778899",
        "urgency": "medium",
        "time": _dt(1, "16:20:00"),
        "duration": "00:03:50",
        "summary": "Patientin hat seit einer Woche wiederkehrende Kopfschmerzen, besonders am Nachmittag. Paracetamol hilft nur kurzfristig. Kein Trauma, keine Sehstörungen.",
        "status": "read",
        "symptoms": ["Kopfschmerzen", "Müdigkeit"],
        "callback_requested": False,
        "callback_completed": False,
        "notes": None,
    },
    {
        "name": "Franz Wimmer",
        "phone": "+43 660 2223344",
        "urgency": "low",
        "time": _dt(1, "14:00:00"),
        "duration": "00:01:55",
        "summary": "Patient fragt nach Ergebnissen seiner Blutuntersuchung von letzter Woche. Alle Werte im Normalbereich.",
        "status": "read",
        "symptoms": ["Laborbefund"],
        "callback_requested": False,
        "callback_completed": False,
        "notes": "Befund per Post zugeschickt",
    },
    {
        "name": "Sophie Lechner",
        "phone": "+43 676 1112233",
        "urgency": "medium",
        "time": _dt(1, "11:30:00"),
        "duration": "00:04:00",
        "summary": "Patientin berichtet über Halsschmerzen und Schluckbeschwerden seit zwei Tagen. Leichtes Fieber (37.8°C). Keine Atembeschwerden.",
        "status": "unread",
        "symptoms": ["Halsschmerzen", "Schluckbeschwerden", "Fieber"],
        "callback_requested": True,
        "callback_completed": False,
        "notes": None,
    },
    {
        "name": "Michael Hofer",
        "phone": "+43 664 4445566",
        "urgency": "low",
        "time": _dt(1, "09:00:00"),
        "duration": "00:02:20",
        "summary": "Patient möchte einen Termin für die jährliche Vorsorgeuntersuchung vereinbaren. Keine aktuellen Beschwerden.",
        "status": "read",
        "symptoms": ["Vorsorgeuntersuchung"],
        "callback_requested": False,
        "callback_completed": False,
        "notes": "Termin am 25.02. um 10:00 eingetragen",
    },
    {
        "name": "Julia Wagner",
        "phone": "+43 699 8889900",
        "urgency": "high",
        "time": _dt(2, "15:45:00"),
        "duration": "00:06:20",
        "summary": "Patientin berichtet über starke allergische Reaktion nach Einnahme eines neuen Medikaments. Hautausschlag am ganzen Körper, leichte Schwellung im Gesicht.",
        "status": "read",
        "symptoms": ["Allergische Reaktion", "Hautausschlag", "Schwellung"],
        "callback_requested": True,
        "callback_completed": True,
        "callback_completed_at": _dt(2, "16:30:00"),
        "notes": "Medikament abgesetzt. Antihistaminikum verschrieben. Kontrolle in 3 Tagen.",
    },
    {
        "name": "Peter Maier",
        "phone": "+43 650 6667788",
        "urgency": "medium",
        "time": _dt(2, "10:15:00"),
        "duration": "00:03:30",
        "summary": "Patient hat Rückenschmerzen im Lendenbereich seit dem Wochenende. Keine Ausstrahlung in die Beine. Kann sich eingeschränkt bewegen.",
        "status": "read",
        "symptoms": ["Rückenschmerzen", "Bewegungseinschränkung"],
        "callback_requested": False,
        "callback_completed": False,
        "notes": None,
    },
    {
        "name": "Katharina Fuchs",
        "phone": "+43 660 3332211",
        "urgency": "low",
        "time": _dt(3, "13:00:00"),
        "duration": "00:02:10",
        "summary": "Patientin erkundigt sich nach Impfmöglichkeiten für die kommende Grippesaison. Keine Allergien bekannt.",
        "status": "read",
        "symptoms": ["Impfberatung"],
        "callback_requested": False,
        "callback_completed": False,
        "notes": "Impftermin vereinbart",
    },
    {
        "name": "Georg Schwarz",
        "phone": "+43 676 9998877",
        "urgency": "medium",
        "time": _dt(3, "08:30:00"),
        "duration": "00:04:15",
        "summary": "Patient berichtet über wiederkehrende Magenschmerzen nach dem Essen. Verdacht auf Gastritis. Empfehlung: Magenspiegelung.",
        "status": "read",
        "symptoms": ["Magenschmerzen", "Verdauungsbeschwerden"],
        "callback_requested": True,
        "callback_completed": False,
        "notes": None,
    },
]


async def seed():
    async with async_session() as session:
        # Clear existing data
        await session.execute(text("DELETE FROM calls"))
        await session.commit()

        for data in SEED_CALLS:
            call = Call(
                name=data["name"],
                phone=data["phone"],
                urgency=data["urgency"],
                time=data["time"],
                duration=data["duration"],
                summary=data["summary"],
                status=data["status"],
                symptoms=data["symptoms"],
                callback_requested=data["callback_requested"],
                callback_completed=data["callback_completed"],
                callback_completed_at=data.get("callback_completed_at"),
                notes=data.get("notes"),
                created_at=data["time"],
                updated_at=data.get("callback_completed_at") or data["time"],
            )
            session.add(call)

        await session.commit()
        print(f"Seeded {len(SEED_CALLS)} calls.")


if __name__ == "__main__":
    asyncio.run(seed())
