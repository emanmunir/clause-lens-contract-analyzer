"""HTTP endpoints for the Clause Lens API.

Routes implemented here:

* ``GET  /api/health``  — liveness + which provider is active.
* ``POST /api/analyze`` — analyze a contract from either an uploaded file
  (multipart/form-data) or a JSON body ``{"text": "..."}``.

The router is mounted under the ``/api`` prefix by :mod:`app.main`.
"""

from __future__ import annotations

import json

from fastapi import APIRouter, Depends, File, Request, UploadFile
from fastapi import status as http_status
from fastapi.exceptions import HTTPException

from app.config import Settings, get_settings
from app.schemas import ContractAnalysis, HealthResponse
from app.services.analyzer import (
    EmptyDocumentError,
    analyze_file,
    analyze_text,
)
from app.services.extract import ExtractionError
from app.services.provider import ProviderError

router = APIRouter(prefix="/api", tags=["clause-lens"])


@router.get("/health", response_model=HealthResponse)
def health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Report service health and the active provider (``anthropic`` or ``mock``)."""
    return HealthResponse(status="ok", provider=settings.provider_name)


def _serialize(analysis: ContractAnalysis) -> dict:
    """Serialize the analysis to the camelCase JSON shape the contract requires."""
    return analysis.model_dump(by_alias=True)


async def _read_json_text(request: Request) -> str:
    """Parse a JSON body and return its non-empty ``text`` field.

    Raises:
        HTTPException: 422 if the body is not valid JSON or ``text`` is missing
            or empty.
    """
    raw = await request.body()
    try:
        payload = json.loads(raw)
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise HTTPException(
            status_code=http_status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Request body must be valid JSON.",
        ) from exc

    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=http_status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="JSON body must be an object with a 'text' field.",
        )

    text = payload.get("text")
    if not isinstance(text, str) or not text.strip():
        raise HTTPException(
            status_code=http_status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="JSON body must include a non-empty 'text' field.",
        )
    return text


@router.post("/analyze", response_model=ContractAnalysis, response_model_by_alias=True)
async def analyze(
    request: Request,
    file: UploadFile | None = File(default=None),
    settings: Settings = Depends(get_settings),
) -> dict:
    """Analyze a contract supplied as an uploaded file or a JSON text body.

    Accepts either:

    * ``multipart/form-data`` with a ``file`` field (a .pdf/.docx/.txt), or
    * ``application/json`` with ``{"text": "..."}``.

    Returns the structured :class:`ContractAnalysis` as camelCase JSON.

    Error semantics:

    * 422 — no input provided, or malformed input.
    * 502 — the analysis provider failed.
    """
    try:
        if file is not None:
            data = await file.read()
            analysis = analyze_file(file.filename or "upload", data, settings)
        else:
            text = await _read_json_text(request)
            analysis = analyze_text(text, settings)
    except (ExtractionError, EmptyDocumentError) as exc:
        # Bad input the caller can fix.
        raise HTTPException(
            status_code=http_status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except ProviderError as exc:
        # Upstream provider failure -> Bad Gateway, per the API contract.
        raise HTTPException(
            status_code=http_status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    return _serialize(analysis)
