# AI-DSS: AI-Based Data-Driven Decision Support System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Scikit-learn](https://img.shields.io/badge/scikit--learn-1.5+-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack, production-grade Decision Support System that evaluates student academic stability using machine learning, interactive visualisations, and real-time what-if simulation.

- **Frontend:** Next.js + React + TypeScript with a bespoke corporate design system (Tailwind CSS), fully responsive on mobile, tablet and desktop.
- **Backend:** Python FastAPI REST API — CORS-enabled, documented, versioned.
- **Database:** SQLAlchemy over PostgreSQL (Neon) — users, students, reports and interventions are persisted and shared across all roles.
- **AI layer:** Five scikit-learn classifiers trained **in memory** at startup on `student_data.csv`. **100% free** — no API keys, no cloud AI.

Built as an academic mini-project, this system demonstrates the integration of **five ML classifiers**, **composite scoring (ASI)**, **counterfactual recommendations**, **model transparency**, and a **what-if simulator** into a cohesive analytics platform.

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [ML Model & ASI Formula](#ml-model--asi-formula)
- [Demo Credentials](#demo-credentials)
- [Production Build](#production-build)
- [Contributing](#contributing)
- [License](#license)

---

## Key Features

- **Corporate-grade landing page** — hero with live model preview, feature grid, how-it-works, live model insights, demo cards and tech stack sections
- **Authentication & sign-up** — PBKDF2-hashed accounts persisted in Postgres; normal users sign up and sign in with a bearer token; exactly **four seeded demo accounts** open one-click role dashboards
- **Role-based dashboards** — dedicated views for **student, faculty, admin and advisor**, each reading live data from the database
- **Student roster** — staff create, edit and delete student profiles; the owning student account sees its own linked profile
- **Persisted reports** — every per-student analysis is saved as a report with input snapshot; students see only their own, staff see everything
- **Intervention planner** — advisors schedule per-student support with priority and notes, tracked through an open → in-progress → done workflow
- **User management** — admins review every account and role on the platform
- **Student Input Form** — Slider-based form for all 8 academic indicators with quick presets (Balanced / High Achiever / At Risk)
- **ML-Powered Analysis** — 5-model ensemble (soft vote) via FastAPI for real-time predictions
- **Academic Stability Index (ASI)** — Data-calibrated weighted composite of ML probability, attendance, and study habits
- **Risk Classification** — Three-tier risk categorisation: Stable, Monitor Closely, Intervention Required
- **Interactive Visualisations** — ASI gauge, radar (spider) chart, score-vs-benchmark bars, model agreement bars, and feature importance (custom SVG, no charting CDN)
- **Counterfactual Recommendations** — Ranked actions with predicted probability gain and impact ratings
- **What-If Simulator** — Live re-analysis as sliders move (debounced) for scenario exploration
- **Model Comparison** — Side-by-side evaluation of five ML algorithms with sortable metrics, metric radars and confusion matrices
- **Export / Print** — Print-optimised reports (browser print → PDF)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14 + React 18 + TypeScript | App Router, SSR, typed UI |
| **Styling** | Tailwind CSS 3.4 | Bespoke corporate design system |
| **Charts** | Custom SVG + Recharts | Gauge, radar, bars — no CDN dependency |
| **Icons** | lucide-react | Crisp, consistent iconography |
| **Backend** | Python 3 + FastAPI | Versioned JSON REST API |
| **Database** | SQLAlchemy + PostgreSQL (Neon) | Persisted users, students, reports, interventions |
| **ML Model** | scikit-learn | 5 classifiers + soft-vote ensemble |
| **Data Processing** | Pandas + NumPy | Dataset handling and feature engineering |
| **HTTP Client** | native `fetch` | Browser-to-API communication |

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)  →  Vercel                       │
│   Landing · Login · Dashboard · Simulator · Model Insights            │
│   Students · Reports · Interventions · Users                           │
│   Next.js + React + TypeScript (responsive, SSR)                      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ HTTP JSON (CORS-enabled, bearer auth)
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│            BACKEND (FastAPI + Uvicorn on Render)                      │
│   JSON API  (/api/analyze, /api/auth, /api/students, …)               │
│   ML engine (5 models trained at startup on student_data.csv)         │
│   SQLAlchemy ORM — persistence layer                                  │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│         DATABASE  (PostgreSQL on Neon)                                │
│   users · students · reports · interventions                          │
└──────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Input → Preprocessing → ML Prediction → ASI Computation
    → Risk Classification → Recommendations → Interactive Report
```

---

## Project Structure

```
dss-mip/
├── frontend/                     # Next.js + React + TypeScript app
│   ├── src/app/                  # App Router pages (landing, login, app group)
│   ├── src/components/           # UI kit, charts, forms, report, layout
│   ├── src/lib/                  # API client + utilities
│   ├── src/types/                # Shared TypeScript contracts
│   ├── .env.example              # NEXT_PUBLIC_API_BASE_URL template
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entry (CORS + routers + init_db)
│   │   ├── config.py             # Centralised settings & thresholds
│   │   ├── db/                   # SQLAlchemy engine, models & seed data
│   │   ├── api/routes/           # HTTP JSON API (auth, students, reports, …)
│   │   ├── schemas/              # Pydantic DTOs
│   │   ├── core/                 # Security (hashing/tokens) + domain logic
│   │   ├── services/             # Business orchestration
│   │   ├── models/               # ML training & model registry
│   │   └── data/                 # Datasets (student_data.csv)
│   ├── tests/                    # Pytest API tests
│   ├── .env.example              # DATABASE_URL template
│   ├── requirements.txt          # Runtime dependencies
│   └── requirements-dev.txt      # Test dependencies
├── docs/                         # Architecture, API & development docs
├── scripts/                      # start-dev.bat / start-dev.sh
├── .github/workflows/ci.yml      # CI pipeline (backend + frontend)
├── Dockerfile                    # Python backend container
├── docker-compose.yml            # Local container orchestration
├── vercel.json                   # Vercel frontend service config
├── .env.example                  # Environment template
├── LICENSE                       # MIT license
└── README.md                     # This file
```

> A detailed annotated breakdown lives in [`docs/project-structure.md`](docs/project-structure.md).

---

## Getting Started

### Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- npm (bundled with Node.js)

> **Quick start:** run `scripts\start-dev.bat` (Windows) or `./scripts/start-dev.sh` (Unix/macOS) to launch both servers.

### Setup (backend)

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate    # Linux/Mac
# venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Configure the database connection
cp .env.example .env        # Windows: copy .env.example .env
# Edit backend/.env and set DATABASE_URL to your PostgreSQL (Neon) URL.
# A local SQLite file is used automatically when DATABASE_URL is unset.

# Start the API (trains models at startup)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Interactive API documentation: **http://localhost:8000/docs**

The database is seeded on first boot with four demo accounts and six student profiles. Sign-ups create new accounts in the same database.

### Setup (frontend)

```bash
cd frontend
npm install
npm run dev
```

The app is available at: **http://localhost:3000**

In dev mode the frontend calls `http://localhost:8000` by default. To point it at a different API, create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/health` | Server health check + loaded models | — |
| `POST` | `/api/login` | User authentication (JSON) | — |
| `POST` | `/api/signup` | Create a new account (student role) | — |
| `GET` | `/api/users` | List all user accounts | admin |
| `POST` | `/api/analyze` | Run full ML analysis on a student profile | — |
| `POST` | `/api/simulate` | What-if simulation (same engine as analyze) | — |
| `GET` | `/api/model-comparison` | Evaluation metrics for all trained models | — |
| `GET` | `/api/feature-importance` | Random Forest feature importances | — |
| `GET/POST` | `/api/students` | List / create student profiles | staff |
| `GET/PUT/DELETE` | `/api/students/{id}` | Read / update / delete a profile | staff |
| `POST` | `/api/students/{id}/analyze` | Run analysis and persist a report | staff + owner |
| `GET` | `/api/reports` | List reports (own for students) | user |
| `GET/POST` | `/api/interventions` | List / create interventions | staff |
| `PATCH/DELETE` | `/api/interventions/{id}` | Update / delete an intervention | advisor+ / admin |

### Example: `/api/analyze`

```json
{
  "name": "Arjun Sharma",
  "previous_gpa": 6.5,
  "internal_score": 60,
  "study_hours": 9,
  "attendance": 72,
  "assignment_rate": 75,
  "parental_education": 2,
  "internet_access": 1,
  "extracurricular": 0
}
```

**Response:**

```json
{
  "ml_probability": 61.2,
  "ensemble_probability": 58.4,
  "confidence": 80.0,
  "asi": 57.8,
  "risk_category": "Monitor Closely",
  "predicted_class": "Strong Performer",
  "recommendations": [{ "action": "Improve Attendance", "probability_gain": 24.5 }],
  "feature_importance": [{ "feature": "Attendance", "importance": 0.31 }],
  "all_model_probs": [{ "model": "Logistic Regression", "probability": 61.2 }]
}
```

> Full schemas and field notes: [`docs/api.md`](docs/api.md)

---

## ML Model & ASI Formula

### Academic Stability Index (ASI)

The ASI is a weighted composite metric that combines the ML prediction probability with behavioural indicators. Weights are **data-calibrated at startup** from the training set:

```
ASI = (ML Probability × 0.50)
    + (Attendance Score × 0.30)
    + (Study Hours Score × 0.20)
```

### Risk Thresholds

| Category | ASI Range | Action |
|---|---|---|
| 🟢 **Stable** | ASI ≥ 70% | Maintain current approach |
| 🟡 **Monitor Closely** | 45% ≤ ASI < 70% | Review and provide guidance |
| 🔴 **Intervention Required** | ASI < 45% | Immediate academic intervention |

> Bands and weights are re-learned from the training data at startup, so exact cutoffs may vary slightly by environment.

### Model Details

- **Algorithms:** Logistic Regression, Decision Tree, Random Forest, K-Nearest Neighbors, Gradient Boosting
- **Ensemble:** soft-vote mean of all five model probabilities
- **Features:** 8 academic and behavioural indicators
- **Training Data:** 1,000 synthetic student records (800 train / 200 test)
- **Calibration:** class cutoff via Youden's J (ROC) on held-out data
- **Counterfactual recommendations:** each actionable feature is simulated against the ensemble; probability gain ranks the top 4

---

## Demo Credentials

Each demo card on the landing page and login screen signs in instantly with one click. These four accounts are seeded into the database on first boot.

| Username | Password | Display Name | Role |
|---|---|---|---|
| `student` | `student123` | Arjun Sharma | Student |
| `faculty` | `faculty123` | Prof. Meera Iyer | Faculty |
| `admin` | `admin123` | Dr. Admin | Admin |
| `advisor` | `advisor123` | Sara Nair | Advisor |

Normal users can also **create their own account** from the login screen (Create account tab) — new users get the `student` role and their own personal dashboard.

---

## Production Build

Two services, both on free tiers:

1. **Vercel** — hosts the Next.js frontend (root `vercel.json` points at `frontend/`).
2. **Render** — hosts the FastAPI backend as a single-worker Docker web service (`Dockerfile`).

```bash
# Build the frontend
cd frontend && npm run build

# Build the backend image locally
docker compose build
docker compose up -d
# API docs: http://localhost:8000/docs
```

> Use a **single worker** — the models are trained in memory at startup and shared within the process.

See [`docs/development.md`](docs/development.md) for deployment details.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Acknowledgements

- Built as a Mini Project for academic submission
- [Next.js](https://nextjs.org/) — React framework with SSR
- [FastAPI](https://fastapi.tiangolo.com/) — Modern Python web framework
- [scikit-learn](https://scikit-learn.org/) — Machine learning toolkit
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling

---

<div align="center">
  <strong>AI-Based Data-Driven Decision Support System</strong> ·
  Built with ❤️ for Academic Excellence
</div>
