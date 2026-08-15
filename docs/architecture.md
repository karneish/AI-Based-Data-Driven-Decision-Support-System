# System Architecture

## Overview

DSS-MIP is a full-stack, AI-based Decision Support System that evaluates student academic stability using machine learning, composite scoring, and interactive visualisation.

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────────────────┐ │
│  │ Landing  │  │  Login   │  │ Dashboard  │  │   Simulator        │ │
│  │  Page    │  │  Page    │  │  (Shell)   │  │   Panel            │ │
│  └──────────┘  └──────────┘  └─────┬─────┘  └────────────────────┘ │
│                                     │                                │
│                        ┌────────────┴────────────┐                  │
│                        │  Recharts / Framer /     │                  │
│                        │  shared components       │                  │
│                        └─────────────────────────┘                  │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ HTTP (Axios via Vite proxy)
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        SERVER (FastAPI + Uvicorn)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │  /api/login  │  │ /api/analyze │  │      /api/simulate         │  │
│  │ Authenticate │  │ ML Analysis  │  │   What-If Simulation       │  │
│  └──────────────┘  └──────┬───────┘  └───────────────────────────┘  │
│                            │                                         │
│                   ┌────────▼────────┐                                │
│                   │ Models (sklearn)│ 4 algorithms, trained at      │
│                   │  + ASI + Risk   │ startup on student_data.csv   │
│                   └─────────────────┘                                │
└──────────────────────────────────────────────────────────────────────┘
```

## Backend layering

The backend is organised as a small hexagonal-style Python package:

1. **HTTP layer** — `app/api/routes` maps HTTP verbs to handlers, delegates to services.
2. **Service layer** — `app/services/analysis.py` composes the full analysis pipeline.
3. **Domain layer** — `app/core` holds pure rules: ASI formula, risk thresholds, recommendation engine, chart-payload builders, user registry.
4. **ML layer** — `app/models/trainer.py` loads the CSV, trains four classifiers, evaluates them, and keeps an in-memory registry used at request time.
5. **Configuration** — `app/config.py` centralises every tunable (feature lists, ASI weights, risk thresholds, dataset stats).

### Data flow

```
User Input → Pydantic validation → Scaler transform
  → ML probability (selected model)
  → ASI composite (ML 0.50 · Attendance 0.30 · Study Hours 0.20)
  → Risk classification (Stable / Monitor / Intervention)
  → Recommendation engine
  → JSON payload → Recharts visualisation
```

Models are trained once at process startup; runtime requests only perform inference, keeping the API responsive.

## Frontend architecture

Feature-first organisation: every user-facing capability (`auth`, `analysis`, `simulation`, `models`, `home`) lives in `src/features/`, and shared visuals are extracted into `src/components/{ui,charts,layout}`. State is local to the Dashboard shell, which routes between feature panels.

| Feature | Responsibility |
|---|---|
| `home` | Public landing page + platform overview infographics |
| `auth` | Login flow and demo quick-fill |
| `analysis` | Student input form, ML report, printable export |
| `simulation` | What-if scenario sliders with live re-analysis |
| `models` | Side-by-side algorithm performance comparison |

## Deployment topologies

| Mode | Description |
|---|---|
| **Development** | Vite dev server on `:5173` proxies `/api` to Uvicorn on `:8000` |
| **Docker Compose** | `Dockerfile.frontend` builds the SPA and serves it via nginx; nginx proxies `/api` to the `backend` container |
| **Static hosting** | `frontend/dist` can be served by NGINX/Netlify/Vercel; the API is deployed separately |
