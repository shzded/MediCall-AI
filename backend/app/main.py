from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import calls, stats, twilio_webhook

app = FastAPI(title="MediCall-AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calls.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(twilio_webhook.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
