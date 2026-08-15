# DSS-MIP Backend

FastAPI application powering the Decision Support System's REST API and ML inference.

## Layout

```
backend/
├── app/
│   ├── main.py              # FastAPI entry point (uvicorn app.main:app)
│   ├── config.py            # Centralised application settings & constants
│   ├── api/
│   │   ├── __init__.py      # Router aggregation
│   │   └── routes/          # HTTP route handlers (auth, analysis, models, health)
│   ├── schemas/             # Pydantic request/response models
│   ├── core/                # Domain logic (ASI, risk, recommendations, visuals, users)
│   ├── models/              # ML training pipeline & trained-model registry
│   ├── services/            # Business-service orchestration (analysis, auth)
│   └── data/                # Datasets (student_data.csv)
├── tests/                   # Pytest suite using FastAPI TestClient
├── requirements.txt         # Runtime dependencies
├── requirements-dev.txt     # Test/lint dependencies
└── .env.example             # Environment variable template
```

## Run locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows
source .venv/bin/activate         # Linux/macOS
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

## Run tests

```bash
pip install -r requirements-dev.txt
pytest tests -v
```
