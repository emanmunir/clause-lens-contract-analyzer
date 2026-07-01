"""Orchestrates the analyze pipeline: extract -> provider -> ContractAnalysis.

This module ties the pieces together so the route layer stays thin. It exposes
two entry points:

* :func:`analyze_text` — analyze a raw text string.
* :func:`analyze_file` — extract text from an uploaded file, then analyze it.
* :func:`load_sample_contract` — read the bundled sample contract text.
"""

from __future__ import annotations

from pathlib import Path

from app.config import Settings
from app.schemas import ContractAnalysis
from app.services.extract import extract_text
from app.services.provider import get_provider

# Location of the bundled sample contract used by mock mode and the frontend's
# "try sample" feature.
_SAMPLE_CONTRACT_PATH = Path(__file__).parent / "sample_contract.txt"


class EmptyDocumentError(Exception):
    """Raised when there is no text to analyze after extraction/validation."""


def analyze_text(text: str, settings: Settings) -> ContractAnalysis:
    """Analyze a raw contract string.

    Args:
        text: The plain-text contract.
        settings: Application settings (selects the provider).

    Returns:
        The structured contract analysis.

    Raises:
        EmptyDocumentError: If ``text`` is empty or whitespace only.
        app.services.provider.ProviderError: If the LLM provider fails.
    """
    cleaned = text.strip()
    if not cleaned:
        raise EmptyDocumentError("The provided text is empty.")

    provider = get_provider(settings)
    return provider.analyze(cleaned)


def analyze_file(filename: str, data: bytes, settings: Settings) -> ContractAnalysis:
    """Extract text from an uploaded file and analyze it.

    Args:
        filename: The uploaded file's name (used to pick the extractor).
        data: The raw file bytes.
        settings: Application settings (selects the provider).

    Returns:
        The structured contract analysis.

    Raises:
        app.services.extract.ExtractionError: If the file cannot be read.
        EmptyDocumentError: If extraction yields no usable text.
        app.services.provider.ProviderError: If the LLM provider fails.
    """
    # ``extract_text`` already raises on empty output, so this is safe.
    text = extract_text(filename, data)
    return analyze_text(text, settings)


def load_sample_contract() -> str:
    """Return the bundled sample contract as text.

    Raises:
        FileNotFoundError: If the sample file is missing (a packaging error).
    """
    return _SAMPLE_CONTRACT_PATH.read_text(encoding="utf-8")
