"""Standard exception handlers and consistent error response schemas for Estora."""

from typing import Any, Dict, List
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_logger
from real_estate_ml.inference.input_validation import InferenceValidationError

logger = get_logger("estora.exceptions")


def _get_request_id(request: Request) -> str:
    """Safely extract request_id from request state or return placeholder."""
    return getattr(request.state, "request_id", "-")


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle standard HTTP exceptions with consistent JSON envelope."""
    request_id = _get_request_id(request)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "request_id": request_id,
            },
            "detail": exc.detail,
        },
        headers=getattr(exc, "headers", None),
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Format Pydantic schema validation failures into clean, structured responses."""
    request_id = _get_request_id(request)
    errors: List[Dict[str, Any]] = []
    for err in exc.errors():
        field_loc = " -> ".join(str(loc) for loc in err.get("loc", []))
        errors.append({
            "field": field_loc,
            "message": err.get("msg", "Invalid value"),
            "type": err.get("type", "value_error"),
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": 422,
                "message": "Request validation failed.",
                "details": errors,
                "request_id": request_id,
            },
            "detail": errors,
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all error handler preventing stack trace leakage to external clients."""
    request_id = _get_request_id(request)
    logger.exception(
        f"Unhandled Server Error on {request.method} {request.url.path}: {exc}",
        extra={"request_id": request_id},
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": 500,
                "message": "An unexpected internal server error occurred.",
                "request_id": request_id,
            },
            "detail": "An unexpected internal server error occurred.",
        },
    )

async def inference_validation_exception_handler(request: Request, exc: InferenceValidationError) -> JSONResponse:
    """Format domain ML inference validation failures into clean, structured 422 responses."""
    request_id = _get_request_id(request)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": 422,
                "message": str(exc),
                "request_id": request_id,
            },
            "detail": str(exc),
        },
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register all standard error handlers onto the FastAPI application instance."""
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(InferenceValidationError, inference_validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
