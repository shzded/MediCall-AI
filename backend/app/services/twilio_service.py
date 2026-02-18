"""Twilio helper for generating TwiML responses."""

GREETING_DE = (
    "Willkommen bei der Arztpraxis. "
    "Bitte schildern Sie nach dem Signalton Ihr Anliegen. "
    "Drücken Sie die Raute-Taste wenn Sie fertig sind."
)


def voice_twiml(recording_callback_url: str) -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        "<Response>"
        f'<Say language="de-AT">{GREETING_DE}</Say>'
        f'<Record maxLength="300" finishOnKey="#" '
        f'recordingStatusCallback="{recording_callback_url}" '
        f'recordingStatusCallbackMethod="POST" />'
        f'<Say language="de-AT">Vielen Dank für Ihren Anruf. Wir melden uns bei Ihnen.</Say>'
        "</Response>"
    )
