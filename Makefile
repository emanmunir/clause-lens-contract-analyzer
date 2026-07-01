# Clause Lens — AI Contract Analyzer
# Common developer tasks. Run `make help` for the list.

.DEFAULT_GOAL := help
.PHONY: help install dev-backend dev-frontend test build docker-up docker-down

## help: Show this help message.
help:
	@echo "Clause Lens — available make targets:"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## /  /'

## install: Install backend (pip) and frontend (npm) dependencies.
install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

## dev-backend: Run the FastAPI backend with autoreload on :8000.
dev-backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

## dev-frontend: Run the Vite dev server on :5173.
dev-frontend:
	cd frontend && npm run dev

## test: Run the backend test suite.
test:
	cd backend && pytest

## build: Build the production frontend bundle.
build:
	cd frontend && npm run build

## docker-up: Build and start both services with Docker Compose.
docker-up:
	docker compose up --build

## docker-down: Stop and remove the Docker Compose services.
docker-down:
	docker compose down
