# AI-DSS: AI-Based Data-Driven Decision Support System

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Jinja2](https://img.shields.io/badge/Jinja2-3.1+-B41717?logo=jinja&logoColor=white)](https://jinja.palletsprojects.com/)
[![Scikit-learn](https://img.shields.io/badge/scikit--learn-1.5+-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack, production-grade Decision Support System that evaluates student academic stability using machine learning, interactive visualisations, and real-time what-if simulation — served entirely by a **single FastAPI + Jinja2 Python process** (no Node.js build step).

Built as an academic mini-project, this system demonstrates the integration of **five ML classifiers**, **composite scoring (ASI)**, **counterfactual recommendations**, and a **dark-glassmorphism server-rendered dashboard** into a cohesive analytics platform.

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

- **Landing Page** — Hero section, feature cards, and system overview
- **Authentication** — Signed-cookie sessions (`itsdangerous`) with demo quick-fill
- **Student Input Form** — Slider-based form for all 8 academic indicators with preset profile dropdown
- **ML-Powered Analysis** — 5-model ensemble (soft vote) via FastAPI for real-time predictions
- **Academic Stability Index (ASI)** — Data-calibrated weighted composite of ML probability, attendance, and study habits
- **Risk Classification** — Three-tier risk categorisation: Stable, Monitor Closely, Intervention Required
- **Interactive Visualisations** — Radar (spider) chart, feature importance bar chart, score-vs-benchmark column chart, and ASI gauge (Chart.js)
- **AI-Generated Reports** — Detailed overall report with ranked recommendations, impact ratings, and printable PDF export
- **What-If Simulator** — Real-time re-analysis with adjusted parameters for scenario exploration
- **Model Comparison** — Side-by-side evaluation of five ML algorithms with confusion matrices

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Jinja2 + HTML/CSS/JS | Server-rendered pages (no build step) |
| **Styling** | Custom CSS | Dark glassmorphism design system |
| **Charts** | Chart.js (CDN) | Radar, bar, gauge visualisations |
| **Sessions** | itsdangerous | Signed login cookies |
| **Backend** | Python 3 + FastAPI | Web pages + REST API |
| **ML Model** | scikit-learn | 5 classifiers + soft-vote ensemble |
| **Data Processing** | Pandas + NumPy | Dataset handling and feature engineering |
| **HTTP Client** | fetch API | Browser-to-API communication |

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                                │
│  Landing · Login · Dashboard · Simulator · Model Comparison          │
│            Jinja2 HTML + CSS + Chart.js                              │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ HTTP
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                SERVER (FastAPI + Uvicorn — one process)             │
│  Page routes (/ , /login, /dashboard, /simulate, /models, /static)  │
│  JSON API     (/api/analyze, /api/simulate, /api/model-comparison…) │
│  ML engine    (5 models trained at startup on student_data.csv)      │
└──────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Input → Preprocessing → ML Prediction → ASI Computation
    → Risk Classification → Recommendations → Visual Dashboard
```

---

## Project Structure

```
dss-mip/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI entry (pages + API + sessions)
│   │   ├── config.py              # Centralised settings & thresholds
│   │   ├── api/routes/            # HTTP JSON API (auth, analysis, models, health)
│   │   ├── schemas/               # Pydantic DTOs
│   │   ├── core/                  # Domain logic (ASI, risk, recommendations)
│   │   ├── services/              # Business orchestration
│   │   ├── models/                # ML training & model registry
│   │   ├── templates/             # Jinja2 pages
│   │   ├── static/                # CSS / JS / favicon
│   │   └── data/                  # Datasets (student_data.csv)
│   ├── tests/                     # Pytest API tests
│   ├── requirements.txt           # Runtime dependencies
│   └── requirements-dev.txt       # Test dependencies
├── docs/                          # Architecture, API & development docs
├── scripts/                       # start-dev.bat / start-dev.sh
├── .github/workflows/ci.yml       # CI pipeline
├── Dockerfile                    # Single Python container
├── docker-compose.yml             # Local container orchestration
├── .env.example                   # Environment template
├── LICENSE                        # MIT license
└── README.md                      # This file
```

> A detailed annotated breakdown lives in [`docs/project-structure.md`](docs/project-structure.md).

---

## Getting Started

### Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)

> **Quick start:** run `scripts\start-dev.bat` (Windows) or `./scripts/start-dev.sh` (Unix/macOS) to launch the server automatically.

### Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate    # Linux/Mac
# venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Start the server (trains models at startup)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The app is available at: **http://localhost:8000**

Interactive API documentation: **http://localhost:8000/docs**

---

## API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/health` | Server health check + loaded models | — |
| `POST` | `/api/login` | User authentication (JSON) | — |
| `POST` | `/api/analyze` | Run full ML analysis on a student profile | — |
| `POST` | `/api/simulate` | What-if simulation (same engine as analyze) | — |
| `GET` | `/api/model-comparison` | Evaluation metrics for all trained models | — |
| `GET` | `/api/feature-importance` | Random Forest feature importances | — |

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

| Username | Password | Display Name | Role |
|---|---|---|---|
| `karneish` | `pass123` | Karneish | Student |
| `admin` | `admin123` | Dr. Admin | Advisor |
| `student1` | `pass123` | Arjun Sharma | Student |
| `student2` | `pass123` | Priya Menon | Student |

---

## Production Build

The FastAPI backend serves both the API (`/api/*`) and the server-rendered web UI (`/`), so a single Python service hosts the entire app. To run it locally as a single service:

```bash
docker compose up -d
# App + API docs: http://localhost:8000
```

Or run the backend directly:

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

> Use a **single worker** — the models are trained in memory at startup and shared within the process.

Deployment targets: **Render** (Docker web service) and **Vercel** (single FastAPI service, see root `vercel.json`). See [`docs/development.md`](docs/development.md) for details.

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
- [FastAPI](https://fastapi.tiangolo.com/) — Modern Python web framework
- [scikit-learn](https://scikit-learn.org/) — Machine learning toolkit
- [Chart.js](https://www.chartjs.org/) — Composable charting library
- [Jinja2](https://jinja.palletsprojects.com/) — Server-side templating engine

---

<div align="center">
  <strong>AI-Based Data-Driven Decision Support System</strong> ·
  Built with ❤️ for Academic Excellence
</div>
