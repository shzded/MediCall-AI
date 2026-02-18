import io
from datetime import date

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.models.call import Call


def generate_report_pdf(calls: list[Call], stats: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20 * mm, bottomMargin=20 * mm)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    title_style = ParagraphStyle("Title", parent=styles["Title"], fontSize=18, spaceAfter=12)
    elements.append(Paragraph("MediCall-AI — Tagesbericht", title_style))
    elements.append(Paragraph(f"Datum: {date.today().isoformat()}", styles["Normal"]))
    elements.append(Spacer(1, 10 * mm))

    # Stats summary
    elements.append(Paragraph("Übersicht", styles["Heading2"]))
    stats_data = [
        ["Anrufe heute", str(stats.get("today_calls", 0))],
        ["Dringende Anrufe", str(stats.get("urgent_calls", 0))],
        ["Ø Dauer", stats.get("avg_duration", "00:00:00")],
        ["Anrufe diesen Monat", str(stats.get("month_calls", 0))],
        ["Unbearbeitete dringende", str(stats.get("unhandled_urgent", 0))],
    ]
    t = Table(stats_data, colWidths=[120 * mm, 40 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f0f0f0")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 8 * mm))

    # Calls table
    elements.append(Paragraph("Anrufliste", styles["Heading2"]))
    header = ["Name", "Telefon", "Dringlichkeit", "Zeit", "Status"]
    rows = [header]
    for c in calls[:50]:
        rows.append([
            c.name,
            c.phone,
            c.urgency,
            c.time.strftime("%d.%m.%Y %H:%M") if c.time else "",
            c.status,
        ])
    ct = Table(rows, colWidths=[35 * mm, 35 * mm, 30 * mm, 35 * mm, 25 * mm])
    ct.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563eb")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
    ]))
    elements.append(ct)

    doc.build(elements)
    return buffer.getvalue()
