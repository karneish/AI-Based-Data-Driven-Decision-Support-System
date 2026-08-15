# DSS-MIP Project Structure

The repository follows a **monorepo layout** with a clear separation between the FastAPI backend (which also serves the server-rendered web UI), operational tooling, and documentation.

```
dss-mip/
│
├── .github/
│   └── workflows/
│       └── ci.yml                     # CI pipeline: backend tests
│
├── backend/                           # Python FastAPI service (API + web UI)
│   ├── app/                           # Application package
│   │   ├── main.py                    # FastAPI entry point (uvicorn app.main:app)
│   │   │                              #   page routes + session auth + /api/* + /health
│   │   ├── config.py                  # Centralised settings & defaults
│   │   ├── api/                       # HTTP layer
│   │   │   ├── __init__.py            # Aggregates all routers into `api_router`
│   │   │   └── routes/                # Route handlers grouped by resource
│   │   │       ├── auth.py            # POST /api/login
│   │   │       ├── analysis.py        # POST /api/analyze, POST /api/simulate
│   │   │       ├── models.py          # GET /api/model-comparison, GET /api/feature-importance
│   │   │       └── health.py          # GET /health
│   │   ├── schemas/                   # Pydantic request/response DTOs
│   │   │   ├── auth.py                # LoginRequest, LoginResponse
│   │   │   └── analysis.py            # StudentInput
│   │   ├── core/                      # Pure domain logic (framework-independent)
│   │   │   ├── asi.py                 # ASI composite-score formula (AI-calibrated weights)
│   │   │   ├── risk.py                # Risk classification (data-calibrated bands)
│   │   │   ├── recommendations.py     # Counterfactual impact-ranked recommendation engine
│   │   │   ├── visuals.py             # Radar/bar chart payload builders
│   │   │   └── users.py               # Demo user registry + authentication
│   │   ├── services/                  # Business-service orchestration
│   │   │   ├── auth.py                # Login service
│   │   │   └── analysis.py            # Full ML analysis pipeline
│   │   ├── models/                    # Machine-learning layer
│   │   │   └── trainer.py             # Dataset loading, model training, comparison & registry
│   │   ├── templates/                 # Jinja2 server-rendered pages
│   │   │   ├── base.html              #   layout: fonts, Chart.js CDN, background scene
│   │   │   ├── app.html               #   authenticated shell (sidebar + topbar)
│   │   │   ├── landing.html           #   public landing page
│   │   │   ├── login.html             #   sign-in form (POST /login)
│   │   │   ├── dashboard.html         #   student input form + report panel
│   │   │   ├── simulate.html          #   what-if simulator
│   │   │   └── models.html            #   model comparison
│   │   ├── static/                    # Hand-written frontend assets
│   │   │   ├── css/app.css            #   design system (glassmorphism)
│   │   │   ├── js/app.js              #   shared helpers, Chart.js builders, report renderer
│   │   │   ├── js/dashboard.js        #   dashboard page logic
│   │   │   ├── js/simulate.js         #   simulator page logic
│   │   │   ├── js/models.js           #   model comparison page logic
│   │   │   └── favicon.svg            #   browser tab icon
│   │   ├── data/                      # Datasets
│   │   │   └── student_data.csv       # Training dataset (1,000+ student records)
│   │   ├── tests/                     # Pytest suite
│   │   │   └── test_api.py            # API contract tests (TestClient)
│   │   ├── requirements.txt           # Runtime dependencies
│   │   ├── requirements-dev.txt       # Development/test dependencies
│   │   └── .env.example               # Backend environment template
│   │
│   ├── docs/                          # Project documentation
│   │   ├── project-structure.md       # This document
│   │   ├── architecture.md            # System architecture & data flow
│   │   ├── api.md                     # REST API reference
│   │   └── development.md             # Setup, testing & contribution guide
│   │
│   ├── scripts/                       # Operational scripts
│   │   ├── start-dev.bat              # Windows dev startup (single server)
│   │   └── start-dev.sh               # Unix/macOS dev startup
│   │
│   ├── Dockerfile                     # Single Python container (API + web UI)
│   ├── docker-compose.yml             # Local container orchestration
│   ├── .dockerignore                  # Docker build exclusions
│   ├── .env.example                   # Root environment template
│   ├── .gitignore                     # Git exclusion rules
│   ├── LICENSE                        # MIT license
│   └── README.md                      # Project overview (this document's index)
```

## Layer responsibilities

| Layer | Concern |
|---|---|
| `backend/app/api/routes` | HTTP contract, request validation, status codes |
| `backend/app/services` | Business orchestration and pipeline composition |
| `backend/app/core` | Pure domain rules (ASI, risk, recommendations) — no HTTP/framework coupling |
| `backend/app/models` | Model training, evaluation and in-memory registry |
| `backend/app/templates` | Jinja2 page templates rendered server-side by `main.py` |
| `backend/app/static` | Hand-written CSS/JS assets + favicon (served at `/static`) |

## Dependency direction

```
api/routes → services → core
             services → models (trained registry)
                       → schemas (DTOs)

main.py    → api_router (JSON API) + templates + static (server-rendered UI)
```
