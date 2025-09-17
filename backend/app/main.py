from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from .db import database
from .models import models
from .routers import auth, family, quiz

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Empathetic Family Recognition Aid API",
    description="The backend for the Empathetic Family Recognition Aid application.",
    version="0.1.0",
)

# Mount the 'uploads' directory so that images can be served statically
app.mount("/static", StaticFiles(directory="uploads"), name="static")

app.include_router(auth.router)
app.include_router(family.router)
app.include_router(quiz.router)


@app.get("/")
def read_root():
    """
    A simple health-check endpoint to confirm the API is running.
    """
    return {"status": "ok", "message": "Welcome to the Family Recognition Aid API!"}
