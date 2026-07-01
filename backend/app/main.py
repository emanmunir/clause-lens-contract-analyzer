"""FastAPI application entry point for Clause Lens.

Wires up CORS (for the Vite dev server at http://localhost:5173), mounts the
API router, and exposes the ASGI ``app`` object for uvicorn:

    uvicorn app.main:app --reload
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes import router

# Loaded once at import time; CORS origins are read from settings.
settings = get_settings()

app = FastAPI(
    title="Clause Lens — AI Contract Analyzer",
    description=(
        "Analyze contracts and surface parties, key dates, obligations, "
        "risks, and missing clauses in plain English."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    """Minimal landing response so a bare GET / doesn't 404."""
    return {
        "name": "Clause Lens — AI Contract Analyzer",
        "docs": "/docs",
        "health": "/api/health",
    }
