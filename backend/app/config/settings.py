from typing import Literal

from pydantic import BaseModel, ConfigDict

Environment = Literal["development", "staging", "production", "test"]
LogLevel = Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]


class Settings(BaseModel):
    model_config = ConfigDict(frozen=True)

    app_name: str = "AI Personality Portrait API"
    version: str = "0.1.0"
    environment: Environment = "development"
    log_level: LogLevel = "INFO"
    cors_origins: tuple[str, ...] = (
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    )
