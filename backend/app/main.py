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
from .routers import auth, rag

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Moments Life Assistant API",
    description="Backend services for the Moments personal life assistant.",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Mount the 'uploads' directory so that images can be served statically
UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.include_router(auth.router)
app.include_router(rag.router)


@app.get("/")
def read_root():
    """
    A simple health-check endpoint to confirm the API is running.
    """
    return {"status": "ok", "message": "Welcome to the Moments Life Assistant API!"}
