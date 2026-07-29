import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


async def handle_validation_error(
    _request: Request,
    _error: RequestValidationError,
) -> JSONResponse:
    return JSONResponse(
        content={"detail": "Invalid request"},
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
    )


async def handle_unexpected_error(_request: Request, error: Exception) -> JSONResponse:
    logger.error("Unhandled application error", extra={"error_type": type(error).__name__})
    return JSONResponse(
        content={"detail": "Internal server error"},
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(RequestValidationError, handle_validation_error)
    app.add_exception_handler(Exception, handle_unexpected_error)
