from fastapi import FastAPI

from app.config import Settings
from app.core import configure_cors


def register_middleware(app: FastAPI, settings: Settings) -> None:
    configure_cors(app, settings)
