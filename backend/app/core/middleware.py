"""Custom middlewares for Estora FastAPI application.

Provides Request ID correlation tracking, execution timing, and structured access logging.
"""

import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging import get_logger

logger = get_logger("estora.access")


class RequestCorrelationMiddleware(BaseHTTPMiddleware):
    """Middleware ensuring every request has a correlation ID and records execution duration."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Extract existing X-Request-ID from client header or generate new UUIDv4
        req_id = request.headers.get("X-Request-ID")
        if not req_id:
            req_id = str(uuid.uuid4())

        # Store in request state for downstream handlers/loggers
        request.state.request_id = req_id

        start_time = time.perf_counter()

        try:
            response = await call_next(request)
        except Exception as exc:
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.error(
                f"{request.method} {request.url.path} - Unhandled Exception after {duration_ms:.2f}ms: {exc}",
                extra={"request_id": req_id},
            )
            raise exc

        duration_ms = (time.perf_counter() - start_time) * 1000

        # Inject tracing headers into response
        response.headers["X-Request-ID"] = req_id
        response.headers["X-Response-Time-Ms"] = f"{duration_ms:.2f}"

        # Structured access logging (excluding query params or headers that might contain tokens)
        logger.info(
            f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms:.2f}ms)",
            extra={"request_id": req_id},
        )

        return response
