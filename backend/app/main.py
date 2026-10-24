"""Estora FastAPI Application Entry Point.

Configures application lifespan, versioned routing, CORS policies,
structured correlation tracking, and production error boundaries.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import get_logger, setup_logging
from app.core.middleware import RequestCorrelationMiddleware
from app.integrations.ml_inference import load_sale_predictor

# Initialize structured logging
setup_logging(log_level="INFO" if settings.ENVIRONMENT == "production" else "DEBUG")
logger = get_logger("estora.lifespan")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: loads ML models and initializes database schemas and admin credentials."""
    try:
        load_sale_predictor()
        logger.info("Pune residential sale-price model artifact loaded successfully during application startup.")
    except Exception as exc:
        logger.error(f"Could not preload ML model artifact during application startup: {exc}")

    if settings.ENVIRONMENT != "testing":
        try:
            from app.db.base import Base
            from app.db.session import engine, SessionLocal
            from app.db.init_db import init_db
            Base.metadata.create_all(bind=engine)
            with SessionLocal() as db:
                init_db(db)
            logger.info("Database schemas and environment-driven administrative seeds initialized successfully.")
        except Exception as exc:
            logger.warning(f"Database initialization deferred during startup: {exc}")

    yield


app = FastAPI(
    title=f"{settings.PROJECT_NAME} API",
    description="Professional decision-support platform for residential property sale and rent valuations.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
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
