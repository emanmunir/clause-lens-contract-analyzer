"""LLM providers and the factory that selects one by API-key presence.

Two providers implement the same :class:`ContractAnalysisProvider` protocol:

* :class:`AnthropicProvider` — calls Claude with structured outputs and returns
  a validated :class:`~app.schemas.ContractAnalysis`.
* :class:`MockProvider` — returns a realistic canned analysis so the app runs
  and the tests pass with no API key.

:func:`get_provider` picks the right one based on
:attr:`app.config.Settings.has_anthropic_key`.
"""

from __future__ import annotations

from typing import Protocol, runtime_checkable

import anthropic

from app.config import Settings
from app.schemas import (
    ContractAnalysis,
    KeyDate,
    MissingClause,
    Obligation,
    Party,
    Risk,
)
from app.services.prompts import SYSTEM_PROMPT

# Upper bound on output tokens for the analysis. Generous enough for a
# thorough analysis of a multi-page contract without risking truncation.
_MAX_TOKENS = 16000


class ProviderError(Exception):
    """Raised when a provider fails to produce a valid analysis.

    The route layer maps this to an HTTP 502 (Bad Gateway) with the message
    as ``detail``.
    """


@runtime_checkable
class ContractAnalysisProvider(Protocol):
    """Common interface for anything that can analyze a contract."""

    #: ``True`` if this provider returns canned data (no real LLM call).
    mock: bool

    def analyze(self, contract_text: str) -> ContractAnalysis:
        """Analyze ``contract_text`` and return a structured result."""
        ...


class AnthropicProvider:
    """Analyze contracts with Claude using structured (Pydantic) outputs."""

    mock = False

    def __init__(self, settings: Settings) -> None:
        """Create the provider.

        Args:
            settings: Application settings holding the model id. The API key
                itself is read by the SDK from the ``ANTHROPIC_API_KEY``
                environment variable.
        """
        self._settings = settings
        # The SDK reads ANTHROPIC_API_KEY from the environment. We do not pass
        # the key explicitly, so it never lives in application state.
        self._client = anthropic.Anthropic()

    def analyze(self, contract_text: str) -> ContractAnalysis:
        """Send the contract to Claude and return a validated analysis.

        Raises:
            ProviderError: If the API call fails or the model declines /
                returns no parsed output.
        """
        try:
            response = self._client.beta.messages.parse(
                model=self._settings.anthropic_model,
                max_tokens=_MAX_TOKENS,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": contract_text}],
                output_format=ContractAnalysis,
            )
        except anthropic.APIError as exc:
            raise ProviderError(f"Anthropic API error: {exc}") from exc
        except Exception as exc:  # noqa: BLE001 - any failure becomes a 502
            raise ProviderError(f"Failed to analyze contract: {exc}") from exc

        analysis = response.parsed_output
        if analysis is None:
            # The model refused or produced output that did not validate.
            raise ProviderError(
                "The model did not return a valid analysis. It may have "
                "refused the request or the response was incomplete."
            )

        # Guarantee the flag is set correctly for the real path.
        analysis.mock = False
        return analysis


class MockProvider:
    """Return a realistic canned analysis without calling any external API.

    Used automatically whenever no Anthropic API key is configured, so the
    application runs end-to-end (and the test suite passes) with zero keys.
    The canned analysis corresponds to the bundled sample NDA.
    """

    mock = True

    def analyze(self, contract_text: str) -> ContractAnalysis:  # noqa: ARG002
        """Return the canned analysis, ignoring the input text."""
        return _build_mock_analysis()


def get_provider(settings: Settings) -> ContractAnalysisProvider:
    """Return the appropriate provider based on API-key presence.

    Args:
        settings: The application settings.

    Returns:
        An :class:`AnthropicProvider` when an API key is configured, otherwise
        a :class:`MockProvider`.
    """
    if settings.has_anthropic_key:
        return AnthropicProvider(settings)
    return MockProvider()


def _build_mock_analysis() -> ContractAnalysis:
    """Construct the canned analysis returned in mock mode."""
    return ContractAnalysis(
        document_type="Mutual Non-Disclosure Agreement",
        summary=(
            "This is a mutual non-disclosure agreement between Northwind "
            "Analytics and Cedar Grove Software, entered into so the two "
            "companies can explore integrating their products. Both sides may "
            "share confidential information and each agrees to use it only for "
            "that purpose and to keep it secret. The agreement lasts two years, "
            "but the duty to protect any shared confidential information "
            "continues for three years after it is disclosed. It is governed by "
            "California law and includes standard carve-outs for information "
            "that is already public or independently developed."
        ),
        parties=[
            Party(name="Northwind Analytics, Inc.", role="Disclosing / Receiving Party"),
            Party(name="Cedar Grove Software Ltd.", role="Disclosing / Receiving Party"),
        ],
        key_dates=[
            KeyDate(
                label="Effective Date",
                date="March 1, 2025",
                note="The date the agreement takes effect.",
            ),
            KeyDate(
                label="Term Expiration",
                date="March 1, 2027",
                note="Two years after the Effective Date (Section 5).",
            ),
            KeyDate(
                label="Confidentiality Survival",
                date="3 years after each disclosure",
                note=(
                    "Confidentiality duties survive termination and run for "
                    "three years from disclosure (Section 5)."
                ),
            ),
        ],
        obligations=[
            Obligation(
                party="Receiving Party",
                obligation=(
                    "Use the other party's confidential information only to "
                    "evaluate the potential product integration."
                ),
                clause_reference="Section 3(a)",
            ),
            Obligation(
                party="Receiving Party",
                obligation=(
                    "Protect confidential information with at least a "
                    "reasonable degree of care."
                ),
                clause_reference="Section 3(b)",
            ),
            Obligation(
                party="Receiving Party",
                obligation=(
                    "Not disclose confidential information to third parties "
                    "without prior written consent."
                ),
                clause_reference="Section 3(c)",
            ),
            Obligation(
                party="Receiving Party",
                obligation=(
                    "Return or destroy all confidential materials on the "
                    "disclosing party's written request."
                ),
                clause_reference="Section 6",
            ),
        ],
        risks=[
            Risk(
                id="risk-1",
                title="No limitation of liability",
                severity="high",
                clause_reference="Whole agreement (no liability cap present)",
                explanation=(
                    "The agreement does not cap either party's liability for a "
                    "breach, so a disclosure could expose a party to unlimited "
                    "damages."
                ),
                recommendation=(
                    "Add a limitation-of-liability clause with a reasonable cap, "
                    "or at minimum exclude indirect and consequential damages."
                ),
            ),
            Risk(
                id="risk-2",
                title="Short confidentiality survival period",
                severity="medium",
                clause_reference="Section 5",
                explanation=(
                    "Confidentiality obligations end three years after "
                    "disclosure, which may be too short for trade secrets such "
                    "as source code that retain value far longer."
                ),
                recommendation=(
                    "For trade-secret material, negotiate a perpetual "
                    "confidentiality obligation that lasts as long as the "
                    "information remains a trade secret."
                ),
            ),
            Risk(
                id="risk-3",
                title="No governing venue / dispute-resolution mechanism",
                severity="medium",
                clause_reference="Section 8",
                explanation=(
                    "The agreement chooses California law but does not specify "
                    "where disputes are heard or how they are resolved, which "
                    "can lead to jurisdictional fights, especially given the "
                    "UK-based counterparty."
                ),
                recommendation=(
                    "Add a forum-selection clause and consider an arbitration "
                    "provision to make dispute resolution predictable."
                ),
            ),
            Risk(
                id="risk-4",
                title="No injunctive-relief acknowledgment",
                severity="low",
                clause_reference="Whole agreement",
                explanation=(
                    "There is no clause acknowledging that money damages may be "
                    "inadequate for a breach, which usually helps a party obtain "
                    "an injunction quickly."
                ),
                recommendation=(
                    "Add an equitable-remedies clause stating that breach may "
                    "cause irreparable harm and injunctive relief is available."
                ),
            ),
        ],
        missing_clauses=[
            MissingClause(
                clause="Limitation of Liability",
                why_it_matters=(
                    "Without a liability cap, a single breach could result in "
                    "open-ended financial exposure."
                ),
            ),
            MissingClause(
                clause="Indemnification",
                why_it_matters=(
                    "There is no allocation of responsibility for third-party "
                    "claims arising from misuse of confidential information."
                ),
            ),
            MissingClause(
                clause="Dispute Resolution / Forum Selection",
                why_it_matters=(
                    "The agreement picks California law but not a venue or "
                    "process, leaving cross-border disputes uncertain."
                ),
            ),
            MissingClause(
                clause="Injunctive Relief",
                why_it_matters=(
                    "Confidentiality breaches often need to be stopped fast; an "
                    "equitable-remedies clause makes that easier to obtain."
                ),
            ),
        ],
        mock=True,
    )
