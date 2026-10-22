"""Integration tests for Authentication API endpoints (/api/v1/auth)."""

from fastapi.testclient import TestClient


def test_user_registration_success(client: TestClient):
    """Verify standard user registration returns 201 Created and user profile."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newbuyer@estora.internal",
            "password": "SecurePassword123!",
            "full_name": "Aarav Sharma",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "newbuyer@estora.internal"
    assert data["full_name"] == "Aarav Sharma"
    assert data["role"] == "authenticated_user"
    assert "id" in data
    assert "password" not in data
    assert "hashed_password" not in data


def test_user_registration_duplicate_email(client: TestClient):
    """Verify duplicate email registration is rejected with 400 Bad Request."""
    payload = {
        "email": "duplicate@estora.internal",
        "password": "SecurePassword123!",
        "full_name": "Duplicate User",
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


def test_user_registration_validation_short_password(client: TestClient):
    """Verify passwords shorter than 8 characters fail schema validation with 422."""
    res = client.post(
        "/api/v1/auth/register",
        json={"email": "shortpass@estora.internal", "password": "short"},
    )
    assert res.status_code == 422


def test_user_login_success(client: TestClient):
    """Verify valid login returns 200 OK with Bearer access token."""
    client.post(
        "/api/v1/auth/register",
        json={"email": "loginuser@estora.internal", "password": "Password123!"},
    )

    res = client.post(
        "/api/v1/auth/login",
        json={"email": "loginuser@estora.internal", "password": "Password123!"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "loginuser@estora.internal"


def test_user_login_invalid_credentials(client: TestClient):
    """Verify invalid password returns 401 Unauthorized."""
    client.post(
        "/api/v1/auth/register",
        json={"email": "loginuser2@estora.internal", "password": "Password123!"},
    )

    res = client.post(
        "/api/v1/auth/login",
        json={"email": "loginuser2@estora.internal", "password": "WrongPassword!"},
    )
    assert res.status_code == 401
    assert "Invalid email address or password" in res.json()["detail"]


def test_user_logout(client: TestClient, auth_headers: dict):
    """Verify logout terminates session cleanly with 200 OK."""
    res = client.post("/api/v1/auth/logout", headers=auth_headers)
    assert res.status_code == 200
    assert "logged out" in res.json()["message"]


def test_user_logout_unauthorized_without_token(client: TestClient):
    """Verify logout without credentials returns 401 Unauthorized."""
    res = client.post("/api/v1/auth/logout")
    assert res.status_code == 401
