from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings.
    """
    DATABASE_URL: str = "sqlite:///./family_recognition.db"
    
    # Security Configuration - should be set via environment variables
    SECRET_KEY: str = "change-this-secret-key-in-production"  # Override via .env file
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # RAG Configuration
    GEMINI_API_KEY: str = ""
    FAISS_INDEX_PATH: str = "./faiss_indexes"
    CHUNK_SIZE: int = 1000
    MAX_CONTEXT_LENGTH: int = 3000
    SIMILARITY_THRESHOLD: float = 0.7

    class Config:
        env_file = ".env"


def _detect_env_file() -> Path | None:
    """
    Locate an .env file regardless of where the backend is launched from.
    Preference order:
      1. backend/.env       (project backend directory)
      2. .env               (repository root or current working directory)
    """
    backend_root = Path(__file__).resolve().parents[2]
    candidates = [
        backend_root / ".env",
        backend_root.parent / ".env",
    ]
    for path in candidates:
        if path.exists():
            return path
    return None


_env_file = _detect_env_file()
settings = (
    Settings(_env_file=_env_file, _env_file_encoding="utf-8")
    if _env_file
    else Settings()
)
