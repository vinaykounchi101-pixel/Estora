"""Integration tests for User profile API endpoints (/api/v1/users)."""

from fastapi.testclient import TestClient


def test_get_current_user_profile(client: TestClient, auth_headers: dict):
    """Verify authenticated user can retrieve their own profile."""
    res = client.get("/api/v1/users/me", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "testuser@estora.internal"
    assert data["role"] == "authenticated_user"


def test_get_profile_unauthorized(client: TestClient):
    """Verify profile access is rejected without credentials."""
    res = client.get("/api/v1/users/me")
    assert res.status_code == 401


def test_update_user_profile_name(client: TestClient, auth_headers: dict):
    """Verify updating display name updates profile correctly."""
    res = client.patch(
        "/api/v1/users/me",
        headers=auth_headers,
        json={"full_name": "Updated Luxury Estate Client"},
    )
    assert res.status_code == 200
    assert res.json()["full_name"] == "Updated Luxury Estate Client"


def test_update_user_profile_password(client: TestClient, auth_headers: dict):
    """Verify changing user password allows logging in with the new password."""
    update_res = client.patch(
        "/api/v1/users/me",
        headers=auth_headers,
        json={"password": "BrandNewPassword2026!"},
    )
    assert update_res.status_code == 200

    # Test login with new password
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "testuser@estora.internal", "password": "BrandNewPassword2026!"},
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()
