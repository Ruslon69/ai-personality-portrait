import logging

from app.config import Settings


def configure_logging(settings: Settings) -> None:
    logging.basicConfig(
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
        level=settings.log_level,
    )
    logging.getLogger().setLevel(settings.log_level)
