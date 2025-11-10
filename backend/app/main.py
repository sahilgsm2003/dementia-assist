from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from .db import database
from .models import models
from .routers import auth, rag, memories, reminders, locations, medications, emergency, voice_notes, search, family

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Moments Life Assistant API",
    description="Backend services for the Moments personal life assistant.",
    version="0.1.0",
)

# Configure CORS
# Allow all origins for development (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for mobile testing
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Mount the 'uploads' directory so that images can be served statically
UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.include_router(auth.router)
app.include_router(rag.router)
app.include_router(memories.router)
app.include_router(reminders.router)
app.include_router(locations.router)
app.include_router(medications.router)
app.include_router(emergency.router)
app.include_router(voice_notes.router)
app.include_router(search.router)
app.include_router(family.router)


@app.get("/")
def read_root():
    """
    A simple health-check endpoint to confirm the API is running.
    """
    return {"status": "ok", "message": "Welcome to the Moments Life Assistant API!"}
