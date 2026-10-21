.PHONY: setup test lint run-frontend run-backend

setup:
	python scripts/setup_dev.py

test:
	python scripts/run_tests.py

run-backend:
	cd backend && uvicorn app.main:app --reload

run-frontend:
	cd frontend && npm run dev
