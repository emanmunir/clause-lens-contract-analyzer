"""Tests for the health endpoint.

These run with no API key set, so the provider must resolve to ``mock``.
"""

from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app


@pytest.fixture(autouse=True)
def _clear_api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    """Ensure no Anthropic key leaks in from the environment during tests."""
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    # The settings object is cached; clear it so the env change takes effect.
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


@pytest.fixture
def client() -> TestClient:
    """A FastAPI test client for the app."""
    return TestClient(app)


def test_health_returns_ok(client: TestClient) -> None:
    """GET /api/health returns 200 with status 'ok'."""
    response = client.get("/api/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"


def test_health_reports_mock_provider_without_key(client: TestClient) -> None:
    """With no API key configured, the provider is reported as 'mock'."""
    assert os.environ.get("ANTHROPIC_API_KEY") in (None, "")

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["provider"] == "mock"
