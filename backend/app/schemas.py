"""Pydantic request/response models matching the public API contract.

The response shape here is shared by three consumers:

* the HTTP layer (:mod:`app.routes`), which serialises it to JSON,
* the Anthropic provider, which uses :class:`ContractAnalysis` as the
  ``output_format`` for structured-output parsing, and
* the mock provider, which constructs a canned instance.

Keeping a single source of truth guarantees the JSON emitted in mock mode is
byte-for-byte compatible with the LLM-backed path.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Severity = Literal["high", "medium", "low"]


class AnalyzeTextRequest(BaseModel):
    """JSON request body for ``POST /api/analyze`` when sending raw text."""

    text: str = Field(
        ...,
        min_length=1,
        description="The full plain-text contract to analyze.",
    )


class Party(BaseModel):
    """A named entity bound by the contract and its role."""

    name: str = Field(..., description="The party's name as written in the contract.")
    role: str = Field(
        ...,
        description="The party's role, e.g. 'Disclosing Party' or 'Service Provider'.",
    )


class KeyDate(BaseModel):
    """A date the contract hinges on (effective date, term, deadlines)."""

    label: str = Field(..., description="What this date represents, e.g. 'Effective Date'.")
    date: str = Field(
        ...,
        description="The date as it appears in the contract, or a plain description.",
    )
    note: str = Field(
        default="",
        description="Optional context explaining the date's significance.",
    )


class Obligation(BaseModel):
    """A duty imposed on a specific party, with a clause citation."""

    model_config = ConfigDict(populate_by_name=True)

    party: str = Field(..., description="The party responsible for the obligation.")
    obligation: str = Field(..., description="A plain-English statement of the duty.")
    clause_reference: str = Field(
        ...,
        serialization_alias="clauseReference",
        validation_alias="clauseReference",
        description="The clause or section this obligation is drawn from.",
    )


class Risk(BaseModel):
    """An identified risk, graded by severity, with a recommendation."""

    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., description="Stable identifier for the risk, e.g. 'risk-1'.")
    title: str = Field(..., description="Short headline naming the risk.")
    severity: Severity = Field(..., description="One of 'high', 'medium', or 'low'.")
    clause_reference: str = Field(
        ...,
        serialization_alias="clauseReference",
        validation_alias="clauseReference",
        description="The clause or section giving rise to the risk.",
    )
    explanation: str = Field(..., description="Why this is a risk, in plain English.")
    recommendation: str = Field(
        ...,
        description="Concrete, actionable advice to mitigate the risk.",
    )


class MissingClause(BaseModel):
    """A clause that is absent but would normally be expected."""

    model_config = ConfigDict(populate_by_name=True)

    clause: str = Field(..., description="The name of the missing clause.")
    why_it_matters: str = Field(
        ...,
        serialization_alias="whyItMatters",
        validation_alias="whyItMatters",
        description="Why the absence of this clause is a concern.",
    )


class ContractAnalysis(BaseModel):
    """The full structured analysis returned by ``POST /api/analyze``.

    Field aliases render camelCase keys on the wire (``documentType``,
    ``keyDates``, ...) while keeping idiomatic snake_case attribute names in
    Python. Serialise with ``by_alias=True`` (the route does this) to honour
    the contract.
    """

    model_config = ConfigDict(populate_by_name=True)

    document_type: str = Field(
        ...,
        serialization_alias="documentType",
        validation_alias="documentType",
        description="The classified contract type, e.g. 'Non-Disclosure Agreement'.",
    )
    summary: str = Field(
        ...,
        description="A plain-English summary of the contract, 3-6 sentences.",
    )
    parties: list[Party] = Field(
        default_factory=list,
        description="The parties bound by the contract.",
    )
    key_dates: list[KeyDate] = Field(
        default_factory=list,
        serialization_alias="keyDates",
        validation_alias="keyDates",
        description="Dates the contract depends on.",
    )
    obligations: list[Obligation] = Field(
        default_factory=list,
        description="Duties imposed on the parties.",
    )
    risks: list[Risk] = Field(
        default_factory=list,
        description="Risks identified in the contract, graded by severity.",
    )
    missing_clauses: list[MissingClause] = Field(
        default_factory=list,
        serialization_alias="missingClauses",
        validation_alias="missingClauses",
        description="Clauses that are expected but absent.",
    )
    mock: bool = Field(
        default=False,
        description="True when the analysis came from the mock provider (no API key).",
    )


class HealthResponse(BaseModel):
    """Response body for ``GET /api/health``."""

    status: Literal["ok"] = "ok"
    provider: Literal["anthropic", "mock"]
