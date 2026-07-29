import os
from functools import lru_cache

from app.config.settings import Settings


def _parse_origins(value: str) -> tuple[str, ...]:
    return tuple(origin.strip() for origin in value.split(",") if origin.strip())


@lru_cache
def get_settings() -> Settings:
    default_settings = Settings()

    return Settings.model_validate(
        {
            "app_name": os.getenv("APP_NAME", default_settings.app_name),
            "version": os.getenv("APP_VERSION", default_settings.version),
            "environment": os.getenv("APP_ENV", default_settings.environment),
            "log_level": os.getenv("LOG_LEVEL", default_settings.log_level),
            "cors_origins": _parse_origins(
                os.getenv("CORS_ORIGINS", ",".join(default_settings.cors_origins))
            ),
        }
    )
