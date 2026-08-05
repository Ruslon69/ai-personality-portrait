import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.api.router import api_router, get_health
from app.config import Settings
from app.main import create_app


def main() -> None:
    settings = Settings(environment="test", version="health-smoke")
    application = create_app(settings)
    if application is None:
        raise RuntimeError("Application factory did not return an application.")
    route_paths = {getattr(route, "path", None) for route in api_router.routes}
    if "/health" not in route_paths:
        raise RuntimeError("Health route is not registered.")

    payload = get_health(settings).model_dump()
    expected_keys = {"environment", "status", "timestamp", "version"}
    if set(payload) != expected_keys:
        raise RuntimeError(f"Health payload keys differ: {sorted(payload)}")
    if payload["status"] != "ok" or payload["environment"] != "test":
        raise RuntimeError("Health payload status or environment is invalid.")
    if payload["version"] != "health-smoke" or not isinstance(payload["timestamp"], datetime):
        raise RuntimeError("Health payload version or timestamp is invalid.")

    print("Backend health smoke test passed.")


if __name__ == "__main__":
    main()
