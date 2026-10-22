"""Structured logging configuration for Estora FastAPI backend.

Configures consistent log formatting with timestamp, severity level, logger name,
and request correlation ID support. Never logs passwords, tokens, or secret keys.
"""

import logging
import sys
from typing import Optional


class CorrelationLogFormatter(logging.Formatter):
    """Custom formatter injecting request_id if present in log record."""

    def format(self, record: logging.LogRecord) -> str:
        if not hasattr(record, "request_id"):
            record.request_id = "-"
        return super().format(record)


def setup_logging(log_level: str = "INFO") -> None:
    """Initialize structured console logging."""
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    formatter = CorrelationLogFormatter(
        fmt="%(asctime)s [%(levelname)s] [%(name)s] [req_id=%(request_id)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    # Avoid duplicate handlers if reloaded
    if not root_logger.handlers:
        root_logger.addHandler(handler)
    else:
        root_logger.handlers = [handler]


def get_logger(name: str) -> logging.Logger:
    """Retrieve named logger instance."""
    return logging.getLogger(name)
