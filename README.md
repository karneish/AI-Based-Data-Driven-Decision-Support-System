# AI-DSS: AI-Based Data-Driven Decision Support System

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Scikit-learn](https://img.shields.io/badge/scikit--learn-1.3-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack, production-grade Decision Support System that evaluates student academic stability using machine learning, interactive visualisations, and real-time what-if simulation.

Built as an academic mini-project, this system demonstrates the integration of **logistic regression**, **composite scoring (ASI)**, and an **interactive React dashboard** into a cohesive analytics platform.

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [API Reference](#api-reference)
- [ML Model & ASI Formula](#ml-model--asi-formula)
- [Demo Credentials](#demo-credentials)
- [Screenshots](#screenshots)
- [Production Build](#production-build)
- [Contributing](#contributing)
- [License](#license)

---

## Key Features

- **Landing Page** — Hero section, feature cards, and interactive system architecture walkthrough
- **Authentication** — Login system with personalised name-reflected welcome greeting
- **Student Input Form** — Slider-based form for all 8 academic indicators with preset profile dropdown
- **ML-Powered Analysis** — Logistic Regression model via FastAPI for real-time predictions
- **Academic Stability Index (ASI)** — Weighted composite metric combining ML probability, attendance, and study habits
- **Risk Classification** — Three-tier risk categorisation: Stable, Monitor Closely, Intervention Required
- **Interactive Visualisations** — Radar (spider) chart, feature importance bar chart, score-vs-benchmark column chart, and ASI gauge
- **AI-Generated Reports** — Detailed overall report with ranked recommendations and impact ratings
- **What-If Simulator** — Real-time re-analysis with adjusted parameters for scenario exploration
- **Model Comparison** — Side-by-side evaluation of multiple ML algorithms (Logistic Regression, Random Forest, SVM, etc.)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite | Component-based UI framework |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **Charts** | Recharts | Radar, Bar, Column visualisations |
| **Animations** | Framer Motion | Page and component transitions |
| **Backend** | Python 3 + FastAPI | REST API server |
| **ML Model** | scikit-learn | Logistic Regression classifier |
| **Data Processing** | Pandas + NumPy | Dataset handling and feature engineering |
| **HTTP Client** | Axios | Frontend-to-backend communication |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                       │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐ │
│  │ Landing  │  │  Login   │  │ Dashboard  │  │   Simulator      │ │
│  │  Page    │  │  Page    │  │  (Main)    │  │   Panel          │ │
│  └──────────┘  └──────────┘  └─────┬─────┘  └──────────────────┘ │
│                                     │                               │
│                        ┌────────────┴────────────┐                 │
│                        │   Recharts / Framer      │                 │
│                        └─────────────────────────┘                 │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ HTTP (Axios)
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVER (FastAPI + Uvicorn)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  /api/login  │  │ /api/analyze │  │      /api/simulate       │ │
│  │ Authenticate │  │ ML Analysis  │  │   What-If Simulation     │ │
│  └──────────────┘  └──────┬───────┘  └──────────────────────────┘ │
│                            │                                        │
│                   ┌────────▼────────┐                               │
│                   │ Logistic Reg.   │                               │
│                   │ (scikit-learn)  │                               │
│                   └─────────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
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
│   ├── main.py                 # FastAPI server + ML model + all API endpoints
│   ├── requirements.txt        # Python dependencies
│   └── student_data.csv        # Training dataset (1,000+ student records)
├── frontend/
│   ├── public/
│   │   └── favicon.svg         # Browser tab icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Infographics.tsx       # Home overview + architecture diagram
│   │   │   ├── InputForm.tsx          # Student data form with sliders & dropdown
│   │   │   ├── ResultPanel.tsx        # Full report: charts + recommendations
│   │   │   └── SimulatorPanel.tsx     # What-if simulation interface
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx        # Hero, features, CTA
│   │   │   ├── LoginPage.tsx          # Login with name reflection
│   │   │   ├── Dashboard.tsx          # Main app shell with sidebar navigation
│   │   │   └── ModelComparison.tsx    # Multi-algorithm comparison
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces & types
│   │   ├── utils/
│   │   │   └── api.ts                # Axios API client configuration
│   │   ├── App.tsx                    # Root component with routing
│   │   ├── main.tsx                   # Application entry point
│   │   └── index.css                  # Global styles + Tailwind directives
│   ├── index.html                     # HTML entry point
│   ├── package.json                   # Node dependencies & scripts
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   ├── vite.config.ts                 # Vite bundler configuration
│   ├── tsconfig.json                  # TypeScript configuration
│   └── postcss.config.js              # PostCSS configuration
├── .gitignore                         # Git exclusion rules
├── start.bat                          # Windows startup script
├── start.sh                           # Unix/Mac startup script
└── README.md                          # Project documentation (this file)
```

---

## Getting Started

### Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm 9+** or **yarn** — Package manager

### 1. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate    # Linux/Mac
# venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: **http://localhost:8000**

Interactive API documentation: **http://localhost:8000/docs**

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npm run dev
```

The frontend will be available at: **http://localhost:5173**

---

## API Reference

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `GET` | `/health` | Server health check | — |
| `POST` | `/api/login` | User authentication | `{ username, password }` |
| `POST` | `/api/analyze` | Run ML analysis | `{ attendance, study_hours, ... }` |
| `POST` | `/api/simulate` | What-if simulation | `{ adjustments, base_data }` |
| `GET` | `/api/models/compare` | Compare multiple ML models | — |

### Example: `/api/analyze`

```json
{
  "attendance": 85,
  "study_hours": 6,
  "previous_grade": 78,
  "extra_curricular": 1,
  "parent_education": 2,
  "assignments_completed": 90,
  "sleep_hours": 7,
  "motivation_level": 4
}
```

**Response:**

```json
{
  "prediction": "Stable",
  "probability": 0.87,
  "asi_score": 82.4,
  "recommendations": ["Maintain current study habits", "Consider advanced coursework"],
  "feature_importance": {
    "attendance": 0.31,
    "study_hours": 0.22,
    "previous_grade": 0.18
  }
}
```

---

## ML Model & ASI Formula

### Academic Stability Index (ASI)

The ASI is a weighted composite metric that combines the ML prediction probability with behavioural indicators:

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

### Model Details

- **Algorithm:** Logistic Regression (scikit-learn)
- **Features:** 8 academic and behavioural indicators
- **Training Data:** 1,000+ synthetic student records
- **Evaluation Metrics:** Accuracy, Precision, Recall, F1-Score
- **Additional Models (Comparison):** Random Forest, SVM, Decision Tree, KNN

---

## Demo Credentials

| Username | Password | Display Name | Role |
|---|---|---|---|
| `karneish` | `pass123` | Karneish | Student |
| `admin` | `admin123` | Dr. Admin | Advisor |
| `student1` | `pass123` | Arjun Sharma | Student |
| `student2` | `pass123` | Priya Menon | Student |

---

## Screenshots

> *[Screenshots can be added here by placing image files in an `assets/screenshots/` directory]*

| Page | Description |
|---|---|
| **Landing Page** | Hero section with animated feature cards and architecture walkthrough |
| **Login Page** | Clean authentication form with role-based welcome message |
| **Dashboard** | Sidebar navigation with interactive input form |
| **Analysis Report** | Full report with radar chart, bar charts, and ASI gauge |
| **Simulator** | Real-time what-if scenario adjustment panel |
| **Model Comparison** | Side-by-side algorithm performance metrics |

---

## Production Build

```bash
cd frontend
npm run build
```

The production-ready static files will be in `frontend/dist/`, which can be served by any static hosting provider (NGINX, Netlify, Vercel, etc.).

To run the backend in production:

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

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
- [React](https://reactjs.org/) — UI component library
- [Recharts](https://recharts.org/) — Composable charting library
- [scikit-learn](https://scikit-learn.org/) — Machine learning toolkit
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework

---

<div align="center">
  <strong>AI-Based Data-Driven Decision Support System</strong> ·
  Built with ❤️ for Academic Excellence
</div>
