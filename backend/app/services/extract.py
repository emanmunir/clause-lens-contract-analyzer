"""Extract plain text from uploaded documents.

Supported formats:

* ``.pdf``  — parsed with :mod:`pypdf`
* ``.docx`` — parsed with :mod:`python-docx`
* ``.txt`` / ``.md`` — decoded directly as UTF-8

The public entry point is :func:`extract_text`, which dispatches on the file
extension. All extractors raise :class:`ExtractionError` on failure so callers
can translate it into a clean HTTP error.
"""

from __future__ import annotations

import io
from pathlib import Path

from docx import Document
from pypdf import PdfReader

# File extensions this module knows how to read.
SUPPORTED_EXTENSIONS: frozenset[str] = frozenset({".pdf", ".docx", ".txt", ".md"})


class ExtractionError(Exception):
    """Raised when a document cannot be read or produces no usable text."""


def _extract_pdf(data: bytes) -> str:
    """Extract text from a PDF byte string using :mod:`pypdf`."""
    try:
        reader = PdfReader(io.BytesIO(data))
    except Exception as exc:  # noqa: BLE001 - surface any parser failure uniformly
        raise ExtractionError(f"Could not read PDF: {exc}") from exc

    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages)


def _extract_docx(data: bytes) -> str:
    """Extract text from a .docx byte string using :mod:`python-docx`."""
    try:
        document = Document(io.BytesIO(data))
    except Exception as exc:  # noqa: BLE001 - surface any parser failure uniformly
        raise ExtractionError(f"Could not read DOCX: {exc}") from exc

    return "\n".join(paragraph.text for paragraph in document.paragraphs)


def _extract_plaintext(data: bytes) -> str:
    """Decode a plain-text (.txt/.md) byte string as UTF-8."""
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        # Fall back to a lenient decode so odd encodings don't hard-fail.
        return data.decode("utf-8", errors="replace")


def extract_text(filename: str, data: bytes) -> str:
    """Extract plain text from ``data`` based on ``filename``'s extension.

    Args:
        filename: The uploaded file's name, used only to determine the format.
        data: The raw file bytes.

    Returns:
        The extracted plain text, stripped of leading/trailing whitespace.

    Raises:
        ExtractionError: If the extension is unsupported, the file cannot be
            parsed, or no text could be extracted.
    """
    suffix = Path(filename).suffix.lower()

    if suffix not in SUPPORTED_EXTENSIONS:
        supported = ", ".join(sorted(SUPPORTED_EXTENSIONS))
        raise ExtractionError(
            f"Unsupported file type '{suffix or filename}'. "
            f"Supported types: {supported}."
        )

    if suffix == ".pdf":
        text = _extract_pdf(data)
    elif suffix == ".docx":
        text = _extract_docx(data)
    else:  # .txt or .md
        text = _extract_plaintext(data)

    text = text.strip()
    if not text:
        raise ExtractionError(
            "No text could be extracted from the document. "
            "It may be empty, scanned, or image-only."
        )

    return text
