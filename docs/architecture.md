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
4. **ML layer** — `app/models/trainer.py` loads the CSV, trains five classifiers (Logistic Regression, Decision Tree, Random Forest, K-Nearest Neighbors, Gradient Boosting), calibrates the class threshold (Youden's J) and ASI weights, and keeps an in-memory registry used at request time.
5. **Configuration** — `app/config.py` centralises every tunable (feature lists, dataset stats); thresholds and weights are learned from data at startup.

### Data flow

```
User Input → Pydantic validation → Scaler transform
  → ML probability (selected model) + ensemble probability (all 5 models)
  → ASI composite (data-calibrated weights: ML ~0.96 · Attendance · Study Hours)
  → Risk classification (data-calibrated bands: Stable / Monitor / Intervention)
  → Counterfactual recommendation engine (ranked by predicted probability gain)
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
| **Single service (Docker)** | Multi-stage `Dockerfile` compiles the SPA and copies it into `backend/app/static`; FastAPI serves `/api/*` and the SPA (with client-route fallback to `index.html`) from one Python process |

The app is fully containerised in one service — no nginx, no Vercel, no separate static host required.

## AI engine (Tier 1)

| Component | Implementation |
|---|---|
| **Model zoo** | Logistic Regression, Decision Tree, Random Forest, K-Nearest Neighbors, Gradient Boosting (`HistGradientBoostingClassifier`) |
| **Ensemble** | Soft-vote mean of all model probabilities; `confidence` = % of models agreeing on the class |
| **Calibrated thresholds** | Class cutoff derived via Youden's J (ROC) on held-out data; risk bands and ASI weights learned from the training data at startup |
| **Counterfactual recommendations** | Each actionable feature is simulated against the trained ensemble; predicted probability gain ranks the top 4 recommendations per student |
