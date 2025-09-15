from fastapi import FastAPI
from .db import database
from .models import models
from .routers import auth

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Empathetic Family Recognition Aid API",
    description="The backend for the Empathetic Family Recognition Aid application.",
    version="0.1.0",
)

app.include_router(auth.router)


@app.get("/")
def read_root():
    """
    A simple health-check endpoint to confirm the API is running.
    """
    return {"status": "ok", "message": "Welcome to the Family Recognition Aid API!"}
