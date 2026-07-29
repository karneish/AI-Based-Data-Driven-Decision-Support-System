from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score
)
import os

app = FastAPI(title="DSS-MIP API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Users ────────────────────────────────────────────────────────────────────
USERS = {
    "admin":    {"password": "admin123", "name": "Dr. Admin",    "role": "advisor"},
    "student1": {"password": "pass123",  "name": "Arjun Sharma", "role": "student"},
    "student2": {"password": "pass123",  "name": "Priya Menon",  "role": "student"},
    "karneish": {"password": "pass123",  "name": "Karneish",     "role": "student"},
}

FEATURES = [
    "previous_gpa", "internal_score", "study_hours",
    "attendance", "assignment_rate", "parental_education",
    "internet_access", "extracurricular"
]
FEATURE_LABELS = [
    "Previous GPA", "Internal Score", "Study Hours",
    "Attendance", "Assignment Rate", "Parental Education",
    "Internet Access", "Extracurricular"
]

# ─── Train on real CSV dataset ────────────────────────────────────────────────
def load_and_train():
    csv_path = os.path.join(os.path.dirname(__file__), "student_data.csv")
    df = pd.read_csv(csv_path)

    X = df[FEATURES].values
    y = df["performance_label"].values

    # Scaler fitted on RAW data ranges (GPA 0-10, Score 0-100, etc.)
    sc = MinMaxScaler()
    X_scaled = sc.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    models = {
        "Logistic Regression": LogisticRegression(max_iter=500, random_state=42),
        "Decision Tree":       DecisionTreeClassifier(max_depth=6, random_state=42),
        "Random Forest":       RandomForestClassifier(n_estimators=100, random_state=42),
        "K-Nearest Neighbors": KNeighborsClassifier(n_neighbors=7),
    }

    trained = {}
    comparison = []

    for name, clf in models.items():
        clf.fit(X_train, y_train)
        y_pred  = clf.predict(X_test)
        y_proba = clf.predict_proba(X_test)[:, 1]

        acc  = round(accuracy_score(y_test, y_pred) * 100, 2)
        prec = round(precision_score(y_test, y_pred, zero_division=0) * 100, 2)
        rec  = round(recall_score(y_test, y_pred, zero_division=0) * 100, 2)
        f1   = round(f1_score(y_test, y_pred, zero_division=0) * 100, 2)
        auc  = round(roc_auc_score(y_test, y_proba) * 100, 2)
        cv   = round(cross_val_score(clf, X_scaled, y, cv=5, scoring="accuracy").mean() * 100, 2)
        cm   = confusion_matrix(y_test, y_pred).tolist()

        trained[name] = clf
        comparison.append({
            "model": name, "accuracy": acc, "precision": prec,
            "recall": rec, "f1_score": f1, "auc": auc,
            "cv_score": cv, "confusion_matrix": cm,
        })

    best_name = max(comparison, key=lambda x: x["accuracy"])["model"]

    rf_imp = trained["Random Forest"].feature_importances_
    fi = [
        {"feature": FEATURE_LABELS[i], "importance": round(float(rf_imp[i]), 4)}
        for i in range(len(FEATURES))
    ]
    fi.sort(key=lambda x: x["importance"], reverse=True)

    return sc, trained, comparison, best_name, fi


print("Training models on student dataset...")
scaler, TRAINED_MODELS, MODEL_COMPARISON, BEST_MODEL_NAME, GLOBAL_FI = load_and_train()
print(f"All models trained. Best: {BEST_MODEL_NAME}")


# ─── Schemas ──────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str

class StudentInput(BaseModel):
    name: str
    previous_gpa: float       # raw: 0-10
    internal_score: float     # raw: 0-100
    study_hours: float        # raw: 0-20
    attendance: float         # raw: 0-100
    assignment_rate: float    # raw: 0-100
    parental_education: int   # raw: 0-3
    internet_access: int      # raw: 0 or 1
    extracurricular: int      # raw: 0 or 1


# ─── Core analysis ────────────────────────────────────────────────────────────
def build_analysis(data: StudentInput, model_name: str = "Logistic Regression"):

    # ✅ Pass RAW values directly to scaler - NO manual normalization before this
    raw_features = np.array([[
        data.previous_gpa,
        data.internal_score,
        data.study_hours,
        data.attendance,
        data.assignment_rate,
        float(data.parental_education),
        float(data.internet_access),
        float(data.extracurricular)
    ]])

    features_scaled = scaler.transform(raw_features)

    clf     = TRAINED_MODELS.get(model_name, TRAINED_MODELS["Logistic Regression"])
    ml_prob = float(clf.predict_proba(features_scaled)[0][1])

    # ASI formula - normalize only here for the weighted formula
    att_norm   = data.attendance / 100.0
    study_norm = data.study_hours / 20.0
    asi = (ml_prob * 0.50) + (att_norm * 0.30) + (study_norm * 0.20)
    asi = min(max(asi, 0.0), 1.0)

    # Risk classification
    if asi >= 0.70:
        risk, risk_color = "Stable", "green"
    elif asi >= 0.45:
        risk, risk_color = "Monitor Closely", "amber"
    else:
        risk, risk_color = "Intervention Required", "red"

    # Radar data - convert to 0-100 scale for display only
    radar_data = {
        "GPA Score":       round(data.previous_gpa / 10.0 * 100, 1),
        "Internal Score":  round(data.internal_score, 1),
        "Study Hours":     round(data.study_hours / 20.0 * 100, 1),
        "Attendance":      round(data.attendance, 1),
        "Assignment Rate": round(data.assignment_rate, 1),
        "Parental Edu":    round(data.parental_education / 3.0 * 100, 1),
    }

    # Bar chart data
    bar_data = [
        {"label": "GPA",         "score": round(data.previous_gpa / 10.0 * 100, 1), "benchmark": 70},
        {"label": "Internal",    "score": round(data.internal_score, 1),             "benchmark": 70},
        {"label": "Study Hrs",   "score": round(data.study_hours / 20.0 * 100, 1),  "benchmark": 60},
        {"label": "Attendance",  "score": round(data.attendance, 1),                 "benchmark": 75},
        {"label": "Assignments", "score": round(data.assignment_rate, 1),            "benchmark": 80},
    ]

    # Recommendations based on raw values
    recs = []
    if data.attendance < 75:
        recs.append({"action": "Improve Attendance",              "impact": "High",   "detail": f"Current: {data.attendance:.0f}%. Target: 85%+"})
    if data.study_hours < 10:
        recs.append({"action": "Increase Study Hours",            "impact": "High",   "detail": f"Current: {data.study_hours:.1f} hrs/week. Target: 12+ hrs"})
    if data.assignment_rate < 75:
        recs.append({"action": "Improve Assignment Submission",   "impact": "Medium", "detail": f"Current: {data.assignment_rate:.0f}%. Target: 90%+"})
    if data.previous_gpa < 6.0:
        recs.append({"action": "Focus on GPA Improvement",        "impact": "High",   "detail": f"Previous GPA: {data.previous_gpa:.1f}. Target: 7.0+"})
    if data.internal_score < 60:
        recs.append({"action": "Strengthen Internal Scores",      "impact": "Medium", "detail": f"Current: {data.internal_score:.0f}. Target: 70+"})
    if not data.extracurricular:
        recs.append({"action": "Join Extracurricular Activities", "impact": "Low",    "detail": "Improves engagement and holistic development"})
    if not recs:
        recs.append({"action": "Maintain Current Performance",    "impact": "Low",    "detail": "Excellent! Keep up the consistent effort."})

    # All 4 model probabilities using same scaled input
    all_probs = [
        {
            "model": mn,
            "probability": round(float(mc.predict_proba(features_scaled)[0][1]) * 100, 2)
        }
        for mn, mc in TRAINED_MODELS.items()
    ]

    return {
        "ml_probability":     round(ml_prob * 100, 2),
        "asi":                round(asi * 100, 2),
        "risk_category":      risk,
        "risk_color":         risk_color,
        "feature_importance": GLOBAL_FI,
        "radar_data":         radar_data,
        "bar_data":           bar_data,
        "recommendations":    recs,
        "predicted_class":    "Strong Performer" if ml_prob >= 0.5 else "Needs Improvement",
        "selected_model":     model_name,
        "all_model_probs":    all_probs,
    }


# ─── Routes ───────────────────────────────────────────────────────────────────
@app.post("/api/login")
def login(req: LoginRequest):
    user = USERS.get(req.username)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"success": True, "name": user["name"], "role": user["role"], "username": req.username}

@app.post("/api/analyze")
def analyze(data: StudentInput):
    return build_analysis(data)

@app.post("/api/simulate")
def simulate(data: StudentInput):
    return build_analysis(data)

@app.get("/api/model-comparison")
def model_comparison():
    return {
        "models": MODEL_COMPARISON,
        "best_model": BEST_MODEL_NAME,
        "dataset_info": {
            "total_samples": 1000,
            "train_samples": 800,
            "test_samples":  200,
            "features":      len(FEATURES),
            "classes":       ["Needs Improvement", "Strong Performer"],
        }
    }

@app.get("/api/feature-importance")
def feature_importance():
    return {"feature_importance": GLOBAL_FI}

@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": list(TRAINED_MODELS.keys())}