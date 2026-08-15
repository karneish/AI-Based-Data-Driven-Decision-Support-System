# DSS-MIP Project Structure

The repository follows a **monorepo layout** with a clear separation between the Next.js frontend, the FastAPI backend (JSON API), operational tooling, and documentation.

```
dss-mip/
│
├── .github/
│   └── workflows/
│       └── ci.yml                     # CI pipeline: backend tests + frontend build
│
├── frontend/                          # Next.js + React + TypeScript app (Vercel)
│   ├── src/
│   │   ├── app/                       # App Router pages
│   │   │   ├── layout.tsx             #   root layout (Inter font, metadata, AuthProvider)
│   │   │   ├── globals.css            #   design tokens + Tailwind layers
│   │   │   ├── icon.svg               #   custom favicon
│   │   │   ├── page.tsx               #   public landing page
│   │   │   ├── login/page.tsx         #   sign-in page
│   │   │   └── (app)/                 #   protected group (guarded by auth)
│   │   │       ├── layout.tsx         #     auth guard + responsive AppShell
│   │   │       ├── dashboard/page.tsx #     analysis dashboard
│   │   │       ├── simulate/page.tsx  #     what-if simulator
│   │   │       └── models/page.tsx    #     model insights
│   │   ├── components/
│   │   │   ├── ui.tsx                 #   design-system kit (Button, Card, Field, …)
│   │   │   ├── charts.tsx             #   custom SVG gauge/radar/bars + Recharts
│   │   │   ├── auth/                  #   AuthProvider + login form
│   │   │   ├── forms/                 #   student input form (analyze + simulate)
│   │   │   ├── layout/                #   logo, app shell, landing header/footer
│   │   │   ├── landing/               #   hero + landing sections
│   │   │   └── report/                #   full analysis report view
│   │   ├── lib/
│   │   │   ├── api.ts                 #   typed fetch client + base-URL resolution
│   │   │   └── utils.ts               #   classnames, formatters, tone maps
│   │   └── types/
│   │       └── index.ts               #   shared TypeScript contracts
│   ├── .env.example                   # NEXT_PUBLIC_API_BASE_URL template
│   ├── tailwind.config.ts             # design tokens → Tailwind theme
│   ├── next.config.mjs
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                           # Python FastAPI JSON API (Render)
│   ├── app/
│   │   ├── main.py                    # FastAPI entry (uvicorn app.main:app)
│   │   │                              #   CORS + /api/* + /health + / → frontend redirect
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
│   │   │   ├── asi.py                 # ASI composite-score formula (data-calibrated weights)
│   │   │   ├── risk.py                # Risk classification (data-calibrated bands)
│   │   │   ├── recommendations.py     # Counterfactual impact-ranked recommendation engine
│   │   │   ├── visuals.py             # Radar/bar chart payload builders
│   │   │   └── users.py               # Demo user registry + authentication
│   │   ├── services/                  # Business-service orchestration
│   │   │   ├── auth.py                # Login service
│   │   │   └── analysis.py            # Full ML analysis pipeline
│   │   ├── models/                    # Machine-learning layer
│   │   │   └── trainer.py             # Dataset loading, training, comparison & registry
│   │   ├── data/                      # Datasets
│   │   │   └── student_data.csv       # Training dataset (1,000+ student records)
│   │   └── tests/
│   │       └── test_api.py            # API contract tests (TestClient)
│   ├── requirements.txt               # Runtime dependencies
│   ├── requirements-dev.txt           # Development/test dependencies
│   └── .env.example                   # Backend environment template
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
├── Dockerfile                         # Single Python container (API)
├── docker-compose.yml                 # Local container orchestration
├── vercel.json                        # Vercel → frontend service (framework: nextjs)
├── .dockerignore                      # Docker build exclusions
├── .env.example                       # Root environment template
├── .gitignore                         # Git exclusion rules
├── LICENSE                            # MIT license
└── README.md                          # Project overview (this document's index)
```

## Layer responsibilities

| Layer | Concern |
|---|---|
| `frontend/src/app` | Routes, layouts, page composition, metadata |
| `frontend/src/components` | Design system, charts, forms, report, shell |
| `frontend/src/lib/api.ts` | Typed HTTP client for the FastAPI backend |
| `backend/app/api/routes` | HTTP contract, request validation, status codes |
| `backend/app/services` | Business orchestration and pipeline composition |
| `backend/app/core` | Pure domain rules (ASI, risk, recommendations) — no HTTP/framework coupling |
| `backend/app/models` | Model training, evaluation and in-memory registry |

## Dependency direction

```
Frontend (React)  →  fetch →  Backend

Backend:
  api/routes → services → core
               services → models (trained registry)
                        → schemas (DTOs)

  main.py → api_router (JSON API) + CORS + / → frontend redirect
```
