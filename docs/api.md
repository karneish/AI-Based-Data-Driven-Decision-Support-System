# REST API Reference

Base URL: `http://localhost:8000` (development). Interactive docs at `/docs` (Swagger) and `/redoc`.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/health` | Server health check + loaded models | — |
| `POST` | `/api/login` | Authenticate a user | — |
| `POST` | `/api/analyze` | Run full ML analysis on a student profile | — |
| `POST` | `/api/simulate` | What-if simulation (same engine as analyze) | — |
| `GET` | `/api/model-comparison` | Evaluation metrics for all trained models | — |
| `GET` | `/api/feature-importance` | Random Forest feature importances | — |

---

## `POST /api/login`

Authenticates against the in-memory demo user registry.

```json
{ "username": "karneish", "password": "pass123" }
```

**200 OK**

```json
{ "success": true, "name": "Karneish", "role": "student", "username": "karneish" }
```

**401** — `{ "detail": "Invalid credentials" }`

---

## `POST /api/analyze`

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

**200 OK**

```json
{
  "ml_probability": 61.2,
  "asi": 57.8,
  "risk_category": "Monitor Closely",
  "risk_color": "amber",
  "feature_importance": [ { "feature": "Attendance", "importance": 0.31 } ],
  "radar_data": { "GPA Score": 65.0, "Attendance": 72.0 },
  "bar_data": [ { "label": "GPA", "score": 65.0, "benchmark": 70 } ],
  "recommendations": [ { "action": "Improve Attendance", "impact": "High", "detail": "Current: 72%. Target: 85%+" } ],
  "predicted_class": "Strong Performer",
  "selected_model": "Logistic Regression",
  "all_model_probs": [ { "model": "Logistic Regression", "probability": 61.2 } ]
}
```

---

## `POST /api/simulate`

Accepts the same `StudentInput` body as `/api/analyze` and returns the identical shape.

---

## `GET /api/model-comparison`

```json
{
  "models": [
    {
      "model": "Logistic Regression",
      "accuracy": 87.5, "precision": 88.1, "recall": 86.9,
      "f1_score": 87.5, "auc": 93.4, "cv_score": 86.2,
      "confusion_matrix": [ [72, 8], [17, 103] ]
    }
  ],
  "best_model": "Logistic Regression",
  "dataset_info": {
    "total_samples": 1000, "train_samples": 800,
    "test_samples": 200, "features": 8,
    "classes": ["Needs Improvement", "Strong Performer"]
  }
}
```

---

## `GET /api/feature-importance`

```json
{
  "feature_importance": [
    { "feature": "Attendance", "importance": 0.31 },
    { "feature": "Study Hours", "importance": 0.22 }
  ]
}
```

---

## `GET /health`

```json
{ "status": "ok", "models_loaded": ["Logistic Regression", "Decision Tree", "Random Forest", "K-Nearest Neighbors"] }
```
