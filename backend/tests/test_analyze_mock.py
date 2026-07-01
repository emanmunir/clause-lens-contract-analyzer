"""Tests for POST /api/analyze in mock mode (no API key required).

These assert the full JSON shape defined in the API contract so the frontend
can rely on it. Everything runs against the :class:`MockProvider`, so the
suite is fully offline and deterministic.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app
from app.services.analyzer import load_sample_contract

# Valid severity values per the contract.
_ALLOWED_SEVERITIES = {"high", "medium", "low"}


@pytest.fixture(autouse=True)
def _clear_api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    """Force mock mode by removing any Anthropic key from the environment."""
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


@pytest.fixture
def client() -> TestClient:
    """A FastAPI test client for the app."""
    return TestClient(app)


def _assert_analysis_shape(body: dict) -> None:
    """Assert ``body`` matches the ContractAnalysis contract exactly."""
    # Top-level scalar fields.
    assert isinstance(body["documentType"], str) and body["documentType"]
    assert isinstance(body["summary"], str) and body["summary"]
    assert body["mock"] is True

    # parties: [{name, role}]
    assert isinstance(body["parties"], list) and body["parties"]
    for party in body["parties"]:
        assert set(party) == {"name", "role"}
        assert isinstance(party["name"], str)
        assert isinstance(party["role"], str)

    # keyDates: [{label, date, note}]
    assert isinstance(body["keyDates"], list) and body["keyDates"]
    for entry in body["keyDates"]:
        assert set(entry) == {"label", "date", "note"}
        assert all(isinstance(entry[k], str) for k in entry)

    # obligations: [{party, obligation, clauseReference}]
    assert isinstance(body["obligations"], list) and body["obligations"]
    for obligation in body["obligations"]:
        assert set(obligation) == {"party", "obligation", "clauseReference"}
        assert all(isinstance(obligation[k], str) for k in obligation)

    # risks: [{id, title, severity, clauseReference, explanation, recommendation}]
    assert isinstance(body["risks"], list) and body["risks"]
    for risk in body["risks"]:
        assert set(risk) == {
            "id",
            "title",
            "severity",
            "clauseReference",
            "explanation",
            "recommendation",
        }
        assert risk["severity"] in _ALLOWED_SEVERITIES
        assert all(isinstance(risk[k], str) for k in risk)

    # missingClauses: [{clause, whyItMatters}]
    assert isinstance(body["missingClauses"], list) and body["missingClauses"]
    for missing in body["missingClauses"]:
        assert set(missing) == {"clause", "whyItMatters"}
        assert all(isinstance(missing[k], str) for k in missing)


def test_analyze_json_text_returns_full_shape(client: TestClient) -> None:
    """POSTing JSON text returns 200 with the full ContractAnalysis shape."""
    response = client.post(
        "/api/analyze",
        json={"text": "This is a sample contract between Alpha Corp and Beta LLC."},
    )

    assert response.status_code == 200
    _assert_analysis_shape(response.json())


def test_analyze_sample_contract_text(client: TestClient) -> None:
    """The bundled sample contract analyzes successfully in mock mode."""
    sample = load_sample_contract()

    response = client.post("/api/analyze", json={"text": sample})

    assert response.status_code == 200
    _assert_analysis_shape(response.json())


def test_analyze_txt_file_upload_returns_full_shape(client: TestClient) -> None:
    """Uploading a .txt file returns 200 with the full ContractAnalysis shape."""
    sample = load_sample_contract()

    response = client.post(
        "/api/analyze",
        files={"file": ("sample_contract.txt", sample.encode("utf-8"), "text/plain")},
    )

    assert response.status_code == 200
    _assert_analysis_shape(response.json())


def test_analyze_empty_text_is_rejected(client: TestClient) -> None:
    """An empty 'text' field is rejected with 422."""
    response = client.post("/api/analyze", json={"text": "   "})

    assert response.status_code == 422


def test_analyze_missing_text_is_rejected(client: TestClient) -> None:
    """A JSON body without a 'text' field is rejected with 422."""
    response = client.post("/api/analyze", json={"not_text": "hello"})

    assert response.status_code == 422


def test_analyze_unsupported_file_type_is_rejected(client: TestClient) -> None:
    """Uploading an unsupported file type is rejected with 422."""
    response = client.post(
        "/api/analyze",
        files={"file": ("data.csv", b"a,b,c\n1,2,3", "text/csv")},
    )

    assert response.status_code == 422
