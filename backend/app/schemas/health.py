from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.config import Environment


class HealthResponse(BaseModel):
    status: Literal["ok"]
    version: str
    environment: Environment
    timestamp: datetime
