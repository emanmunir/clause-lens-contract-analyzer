"""Application configuration loaded from environment variables / a `.env` file."""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings for the Clause Lens backend.

    Values are read from environment variables, falling back to a local
    ``.env`` file (which must be gitignored). Secrets such as the Anthropic
    API key are never hardcoded — they come only from the environment.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Anthropic credentials / model selection.
    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-opus-4-8"

    # Comma-separated list of origins permitted by CORS.
    cors_origins: str = "http://localhost:5173"

    @property
    def has_anthropic_key(self) -> bool:
        """Whether a non-empty Anthropic API key is configured.

        When this is ``False`` the app runs in mock mode.
        """
        return bool(self.anthropic_api_key and self.anthropic_api_key.strip())

    @property
    def provider_name(self) -> str:
        """Human-readable provider identifier for the health endpoint."""
        return "anthropic" if self.has_anthropic_key else "mock"

    @property
    def cors_origins_list(self) -> list[str]:
        """The configured CORS origins as a clean list of strings."""
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    """Return a cached :class:`Settings` instance.

    The cache ensures the ``.env`` file is parsed only once per process.
    """
    return Settings()
