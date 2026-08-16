import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"
if ENV_FILE.exists():
    load_dotenv(ENV_FILE)


class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "DSS-MIP API")
    VERSION: str = "3.0.0"
    DESCRIPTION: str = os.getenv(
        "APP_DESCRIPTION", "AI-Based Data-Driven Decision Support System"
    )
    DEBUG: bool = os.getenv("APP_DEBUG", "true").lower() == "true"

    CORS_ORIGINS: list[str] = [
        o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",")
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list[str] = ["*"]
    CORS_ALLOW_HEADERS: list[str] = ["*"]

    DATA_DIR: Path = BASE_DIR / "data"
    DATASET_PATH: Path = DATA_DIR / "student_data.csv"

    FEATURES: list[str] = [
        "previous_gpa",
        "internal_score",
        "study_hours",
        "attendance",
        "assignment_rate",
        "parental_education",
        "internet_access",
        "extracurricular",
    ]
    FEATURE_LABELS: list[str] = [
        "Previous GPA",
        "Internal Score",
        "Study Hours",
        "Attendance",
        "Assignment Rate",
        "Parental Education",
        "Internet Access",
        "Extracurricular",
    ]

    ASI_WEIGHTS: dict[str, float] = {
        "ml_probability": 0.50,
        "attendance": 0.30,
        "study_hours": 0.20,
    }
    RISK_STABLE_THRESHOLD: float = 0.70
    RISK_MONITOR_THRESHOLD: float = 0.45

    DEFAULT_MODEL: str = "Logistic Regression"

    # Neon Postgres in production; SQLite fallback for local development.
    # Set DATABASE_URL=postgresql://... in your environment for Neon.
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", f"sqlite:///{BASE_DIR.parent / 'dss.db'}"
    )

    FRONTEND_URL: str = os.getenv(
        "FRONTEND_URL", "https://ai-dss-three.vercel.app"
    )

    DATASET_STATS: dict = {
        "total_samples": 1000,
        "train_samples": 800,
        "test_samples": 200,
        "classes": ["Needs Improvement", "Strong Performer"],
    }


settings = Settings()
