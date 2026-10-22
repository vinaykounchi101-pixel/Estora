"""Unit tests for core security module (password hashing and JWT management)."""

from datetime import timedelta
from uuid import uuid4
import pytest

from app.core.security import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)


def test_password_hashing_and_verification():
    """Verify password hashing produces salted hashes and verifies accurately."""
    raw_pass = "EditorialLuxury2026!"
    hashed = get_password_hash(raw_pass)

    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed)
    assert not verify_password("WrongPassword!", hashed)


def test_jwt_token_creation_and_payload_decoding():
    """Verify JWT access tokens preserve subject UUID and role claims."""
    uid = uuid4()
    token = create_access_token(subject=uid, role="authenticated_user")
    payload = decode_access_token(token)

    assert payload is not None
    assert payload["sub"] == str(uid)
    assert payload["role"] == "authenticated_user"
    assert "exp" in payload


def test_jwt_token_expiration():
    """Verify expired JWT tokens return None upon decoding."""
    uid = uuid4()
    expired_token = create_access_token(
        subject=uid,
        expires_delta=timedelta(seconds=-10),
    )
    payload = decode_access_token(expired_token)
    assert payload is None


def test_jwt_invalid_token_handling():
    """Verify malformed or corrupted tokens return None."""
    assert decode_access_token("not-a-token") is None
    assert decode_access_token("") is None
