from fastapi import FastAPI

from app.api.router import api_router
from app.config import Settings, get_settings
from app.core import configure_logging
from app.exceptions import register_exception_handlers
from app.middleware import register_middleware


def create_app(settings: Settings | None = None) -> FastAPI:
    app_settings = settings or get_settings()
    configure_logging(app_settings)

    application = FastAPI(
        title=app_settings.app_name,
        version=app_settings.version,
    )
    application.state.settings = app_settings

    register_middleware(application, app_settings)
    register_exception_handlers(application)
    application.include_router(api_router)

    return application


app = create_app()
