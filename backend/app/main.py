"""Estora FastAPI Application Entry Point.

Configures application lifespan, versioned routing, CORS policies,
structured correlation tracking, and production error boundaries.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging
from app.core.middleware import RequestCorrelationMiddleware

# Initialize structured logging
setup_logging(log_level="INFO" if settings.ENVIRONMENT == "production" else "DEBUG")

app = FastAPI(
    title=f"{settings.PROJECT_NAME} API",
    description="Professional decision-support platform for residential property sale and rent valuations.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. Custom Request Correlation & Timing Middleware
app.add_middleware(RequestCorrelationMiddleware)

# 2. Explicit Environment-based CORS Configuration
# Prevents wildcard '*' with credentials to adhere to strict security baselines
cors_origins = [str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS]
has_wildcard = "*" in cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if not has_wildcard else ["*"],
    allow_credentials=not has_wildcard,  # Forbidden to allow credentials with wildcard origins
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Response-Time-Ms"],
)

# 3. Standard Exception Handlers (no stack traces to clients)
register_exception_handlers(app)

# 4. Versioned API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["root"], summary="API Root Metadata")
def root_metadata():
    """Return platform metadata, active environment, and documentation links."""
    return {
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "api_v1": settings.API_V1_STR,
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health",
    }
