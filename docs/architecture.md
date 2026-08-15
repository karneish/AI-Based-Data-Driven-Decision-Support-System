# System Architecture

## Overview

DSS-MIP is an AI-based Decision Support System that evaluates student academic stability using machine learning, composite scoring, and interactive visualisation. The product is split into **two tiers**:

- **Frontend** — Next.js + React + TypeScript (Vercel). A bespoke corporate design system, fully responsive.
- **Backend** — FastAPI REST API (Render). Pure JSON, CORS-enabled, with the ML engine trained in memory.

```
┌──────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js on Vercel)                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────────────────┐  │
│  │ Landing  │  │  Login   │  │ Dashboard │  │ Simulator / Models │  │
│  └──────────┘  └──────────┘  └───────────┘  └────────────────────┘  │
│      React + TypeScript · Tailwind · custom SVG charts              │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ HTTP JSON (CORS)
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI on Render)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │ /api/login   │  │ /api/analyze │  │      /api/simulate         │  │
│  │  auth        │  │ ML Analysis  │  │   What-If Simulation       │  │
│  └──────────────┘  └──────┬───────┘  └───────────────────────────┘  │
│                     ┌─────▼─────────┐                               │
│                     │ Models (sklearn)│ 5 algorithms, trained at    │
│                     │  + ASI + Risk   │ startup on student_data.csv │
│                     └─────────────────┘                             │
└──────────────────────────────────────────────────────────────────────┘
```

## Backend layering

The backend is organised as a small hexagonal-style Python package:

1. **HTTP layer** — `app/main.py` mounts the CORS middleware, includes `app/api/routes` (`/api/*`) and redirects `/` to the frontend URL; `app/api/routes` maps verbs to handlers, delegating to services.
2. **Service layer** — `app/services/analysis.py` composes the full analysis pipeline.
3. **Domain layer** — `app/core` holds pure rules: ASI formula, risk thresholds, recommendation engine, chart-payload builders, user registry.
4. **ML layer** — `app/models/trainer.py` loads the CSV, trains five classifiers (Logistic Regression, Decision Tree, Random Forest, K-Nearest Neighbors, Gradient Boosting), calibrates the class threshold (Youden's J) and ASI weights, and keeps an in-memory registry used at request time.
5. **Configuration** — `app/config.py` centralises every tunable (feature lists, dataset stats, frontend URL); thresholds and weights are learned from data at startup.

### Data flow

```
User Input → Pydantic validation → Scaler transform
  → ML probability (selected model) + ensemble probability (all 5 models)
  → ASI composite (data-calibrated weights: ML · Attendance · Study Hours)
  → Risk classification (data-calibrated bands: Stable / Monitor / Intervention)
  → Counterfactual recommendation engine (ranked by predicted probability gain)
  → JSON payload → React report visualisations
```

Models are trained once at process startup; runtime requests only perform inference, keeping the API responsive.

## Frontend architecture

The UI is a **Next.js 14 App Router** application with TypeScript throughout:

| Area | Location | Responsibility |
|---|---|---|
| Pages | `src/app/` | Landing, `/login`, and the protected `(app)` group (`/dashboard`, `/simulate`, `/models`) |
| UI kit | `src/components/ui.tsx` | Buttons, cards, fields, sliders, badges, stat cards, skeleton loaders |
| Charts | `src/components/charts.tsx` | Custom SVG gauge, radar, benchmark bars, model agreement, feature lists |
| Forms | `src/components/forms/student-form.tsx` | 8-indicator input with presets + debounced simulate mode |
| Report | `src/components/report/report-view.tsx` | KPI grid, risk banner, charts, counterfactual recommendations |
| Shell | `src/components/layout/app-shell.tsx` | Responsive sidebar (desktop) / drawer (mobile) + topbar |
| API client | `src/lib/api.ts` | Typed `fetch` wrapper; base URL via `NEXT_PUBLIC_API_BASE_URL` |

Auth is client-side: `/api/login` returns a JSON user, stored in `localStorage`; the `(app)` group layout guards protected routes and redirects to `/login`.

## Deployment topologies

| Mode | Description |
|---|---|
| **Development** | Uvicorn on `:8000` (backend) + `next dev` on `:3000` (frontend), Vite-style hot reload |
| **Render** | One Python container from `Dockerfile`; FastAPI serves `/api/*` |
| **Vercel** | One Next.js service (`vercel.json` → `frontend`, framework `nextjs`) |

## AI engine (100% free)

| Component | Implementation |
|---|---|
| **Model zoo** | Logistic Regression, Decision Tree, Random Forest, K-Nearest Neighbors, Gradient Boosting (`HistGradientBoostingClassifier`) |
| **Ensemble** | Soft-vote mean of all model probabilities; `confidence` = % of models agreeing on the class |
| **Calibrated thresholds** | Class cutoff derived via Youden's J (ROC) on held-out data; risk bands and ASI weights learned from the training data at startup |
| **Counterfactual recommendations** | Each actionable feature is simulated against the trained ensemble; predicted probability gain ranks the top 4 recommendations per student |
| **Cost** | Zero — scikit-learn runs locally in the container; no API keys, no cloud AI, no database |
