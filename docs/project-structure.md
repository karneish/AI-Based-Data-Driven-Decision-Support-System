# DSS-MIP Project Structure

The repository follows a **monorepo layout** with a clear separation between the API backend, the web frontend, shared operational tooling, and documentation.

```
dss-mip/
│
├── .github/
│   └── workflows/
│       └── ci.yml                     # CI pipeline: backend tests + frontend typecheck & build
│
├── backend/                           # Python FastAPI service
│   ├── app/                           # Application package
│   │   ├── main.py                    # FastAPI entry point (uvicorn app.main:app)
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
│   │   ├── data/                      # Datasets
│   │   │   └── student_data.csv       # Training dataset (1,000+ student records)
│   │   └── static/                    # Built SPA (populated at Docker build time, git-ignored)
│   ├── tests/                         # Pytest suite
│   │   └── test_api.py                # API contract tests (TestClient)
│   ├── requirements.txt               # Runtime dependencies
│   ├── requirements-dev.txt           # Development/test dependencies
│   ├── .env.example                   # Backend environment template
│   └── README.md                      # Backend-specific documentation
│
├── frontend/                          # React + TypeScript + Vite SPA
│   ├── public/
│   │   └── favicon.svg                # Browser tab icon
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx                # Root component (landing → login → dashboard routing)
│   │   │   └── App styles entry       # (see styles/index.css)
│   │   ├── main.tsx                   # Application bootstrap
│   │   ├── vite-env.d.ts              # Vite client type definitions
│   │   ├── styles/
│   │   │   └── index.css              # Global styles + Tailwind directives
│   │   ├── lib/
│   │   │   └── api.ts                 # Axios HTTP client for the DSS-MIP API
│   │   ├── hooks/
│   │   │   └── useAsync.ts            # Reusable async data-fetching hook
│   │   ├── constants/
│   │   │   ├── models.ts              # Model colours, risk config, metric labels
│   │   │   └── presets.ts             # Student presets, parental education levels
│   │   ├── types/
│   │   │   └── index.ts               # Shared TypeScript interfaces & types
│   │   ├── components/                # Reusable presentational components
│   │   │   ├── ui/                    # Low-level primitives
│   │   │   │   └── SliderField.tsx    # Labelled range slider
│   │   │   ├── charts/                # Chart wrappers (Recharts)
│   │   │   │   ├── ChartTooltip.tsx
│   │   │   │   ├── RadarProfileChart.tsx
│   │   │   │   ├── FeatureImportanceChart.tsx
│   │   │   │   └── ScoreBenchmarkChart.tsx
│   │   │   └── layout/                # Application chrome
│   │   │       ├── Sidebar.tsx        # Dashboard navigation sidebar
│   │   │       └── Topbar.tsx         # Dashboard header bar
│   │   ├── layouts/
│   │   │   └── Dashboard.tsx          # Authenticated app shell (tabs + panels)
│   │   └── features/                  # Feature modules (feature-first architecture)
│   │       ├── home/                  # Marketing / overview
│   │       │   ├── LandingPage.tsx
│   │       │   └── Infographics.tsx
│   │       ├── auth/                  # Authentication
│   │       │   └── LoginPage.tsx
│   │       ├── analysis/              # Student analysis + report
│   │       │   ├── InputForm.tsx
│   │       │   └── ResultPanel.tsx
│   │       ├── simulation/            # What-if scenario simulator
│   │       │   └── SimulatorPanel.tsx
│   │       └── models/                # ML model comparison
│   │           └── ModelComparison.tsx
│   ├── index.html                     # HTML entry point
│   ├── package.json                   # Node dependencies & scripts
│   ├── package-lock.json              # Locked dependency tree
│   ├── vite.config.ts                 # Vite bundler configuration (+ dev proxy)
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── tsconfig.node.json             # TypeScript config for Vite/Node tooling
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   ├── postcss.config.js              # PostCSS configuration
│   └── .env.example                   # Frontend environment template
│
├── docs/                              # Project documentation
│   ├── project-structure.md           # This document
│   ├── architecture.md                # System architecture & data flow
│   ├── api.md                         # REST API reference
│   └── development.md                 # Setup, testing & contribution guide
│
├── scripts/                           # Operational scripts
│   ├── start-dev.bat                  # Windows dev startup (backend + frontend)
│   └── start-dev.sh                   # Unix/macOS dev startup
│
├── Dockerfile                       # Single container: builds frontend, serves API + SPA
├── docker-compose.yml                 # Local container orchestration
├── .dockerignore                      # Docker build exclusions
├── .env.example                       # Root environment template
├── .gitignore                         # Git exclusion rules
├── .gitattributes                     # Git line-ending rules
├── LICENSE                            # MIT license
└── README.md                          # Project overview (this document's index)
```

## Layer responsibilities

| Layer | Concern |
|---|---|
| `backend/app/api/routes` | HTTP contract, request validation, status codes |
| `backend/app/services` | Business orchestration and pipeline composition |
| `backend/app/core` | Pure domain rules (ASI, risk, recommendations) — no HTTP/framework coupling |
| `backend/app/models` | Model training, evaluation and in-memory registry |
| `frontend/src/features` | One folder per user-facing capability; owns its UI |
| `frontend/src/components` | Shared, reusable presentational components |
| `frontend/src/layouts` | Page shells that compose features |
| `frontend/src/lib` | Infrastructure concerns (HTTP client) |
| `frontend/src/constants` | Single source of truth for domain constants |

## Dependency direction

```
api/routes → services → core
             services → models (trained registry)
                       → schemas (DTOs)

features → components → ui / charts
layouts  → features
lib / hooks / constants / types   ← shared across all layers
```
