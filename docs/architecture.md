# System Architecture

## Overview

DSS-MIP is an AI-based Decision Support System that evaluates student academic stability using machine learning, composite scoring, and interactive visualisation. The entire application — API and web UI — runs inside a single FastAPI process.

```
┌──────────────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                                │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────────────────┐  │
│  │ Landing  │  │  Login   │  │ Dashboard  │  │  Simulator /       │  │
│  │  Page    │  │  Page    │  │  (Shell)   │  │  Model Compare     │  │
│  └──────────┘  └──────────┘  └─────┬─────┘  └────────────────────┘  │
│                                     │                                │
│                   Jinja2-rendered HTML + static CSS/JS               │
│                   Chart.js for radar / bar / gauge visualisations   │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ HTTP
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        SERVER (FastAPI + Uvicorn)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │  Page routes │  │ /api/analyze │  │      /api/simulate         │  │
│  │ (/, /login,  │  │ ML Analysis  │  │   What-If Simulation       │  │
│  │  /dashboard… │  └──────┬───────┘  └───────────────────────────┘  │
│  │  + sessions) │         │                                         │
│  └──────────────┘   ┌─────▼─────────┐                               │
│                      │ Models (sklearn)│ 5 algorithms, trained at   │
│                      │  + ASI + Risk   │ startup on student_data.csv │
│                      └─────────────────┘                             │
└──────────────────────────────────────────────────────────────────────┘
```

## Backend layering

The backend is organised as a small hexagonal-style Python package:

1. **HTTP layer** — `app/main.py` defines page routes (Jinja2 templates, signed-cookie sessions); `app/api/routes` maps `/api/*` verbs to handlers, delegating to services.
2. **Service layer** — `app/services/analysis.py` composes the full analysis pipeline.
3. **Domain layer** — `app/core` holds pure rules: ASI formula, risk thresholds, recommendation engine, chart-payload builders, user registry.
4. **ML layer** — `app/models/trainer.py` loads the CSV, trains five classifiers (Logistic Regression, Decision Tree, Random Forest, K-Nearest Neighbors, Gradient Boosting), calibrates the class threshold (Youden's J) and ASI weights, and keeps an in-memory registry used at request time.
5. **Configuration** — `app/config.py` centralises every tunable (feature lists, dataset stats, session secret); thresholds and weights are learned from data at startup.

### Data flow

```
User Input → Pydantic validation → Scaler transform
  → ML probability (selected model) + ensemble probability (all 5 models)
  → ASI composite (data-calibrated weights: ML · Attendance · Study Hours)
  → Risk classification (data-calibrated bands: Stable / Monitor / Intervention)
  → Counterfactual recommendation engine (ranked by predicted probability gain)
  → JSON payload → Chart.js visualisation
```

Models are trained once at process startup; runtime requests only perform inference, keeping the API responsive.

## Frontend architecture

The web UI is server-rendered with **Jinja2 templates** (no build step, no Node). Each page extends a shared layout:

| Template | Responsibility |
|---|---|
| `base.html` | HTML skeleton, fonts, Chart.js CDN, background scene, shared `app.js` |
| `app.html` | Authenticated shell — sidebar navigation + topbar + user chip |
| `landing.html` | Public landing page + platform overview |
| `login.html` | Sign-in form posting to `/login` |
| `dashboard.html` | Student input form (sliders, presets) + full ML report |
| `simulate.html` | What-if scenario sliders with live re-analysis |
| `models.html` | Side-by-side algorithm performance comparison |

Page logic lives in `static/js/*` and styling in `static/css/app.css` (dark glassmorphism design system). Sessions are managed server-side with a signed cookie (`itsdangerous`).

## Deployment topologies

| Mode | Description |
|---|---|
| **Development** | Single Uvicorn process on `:8000` serves pages + `/api` (hot-reload) |
| **Single service (Docker / Render)** | One Python container; FastAPI serves `/`, `/static/*` and `/api/*` |
| **Vercel** | One FastAPI service (`vercel.json` → `backend`, entrypoint `app/main.py`) |

The app is fully self-contained in one Python service — no nginx, no Node, no separate static host required.

## AI engine (Tier 1)

| Component | Implementation |
|---|---|
| **Model zoo** | Logistic Regression, Decision Tree, Random Forest, K-Nearest Neighbors, Gradient Boosting (`HistGradientBoostingClassifier`) |
| **Ensemble** | Soft-vote mean of all model probabilities; `confidence` = % of models agreeing on the class |
| **Calibrated thresholds** | Class cutoff derived via Youden's J (ROC) on held-out data; risk bands and ASI weights learned from the training data at startup |
| **Counterfactual recommendations** | Each actionable feature is simulated against the trained ensemble; predicted probability gain ranks the top 4 recommendations per student |
