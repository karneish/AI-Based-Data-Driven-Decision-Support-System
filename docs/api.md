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
  "ensemble_probability": 58.4,
  "confidence": 80.0,
  "class_threshold": 56.7,
  "asi": 57.8,
  "risk_category": "Monitor Closely",
  "risk_color": "amber",
  "risk_thresholds": { "stable": 52.8, "monitor": 36.8 },
  "asi_weights": { "ml_probability": 0.962, "attendance": 0.008, "study_hours": 0.03 },
  "feature_importance": [ { "feature": "Attendance", "importance": 0.31 } ],
  "radar_data": { "GPA Score": 65.0, "Attendance": 72.0 },
  "bar_data": [ { "label": "GPA", "score": 65.0, "benchmark": 70 } ],
  "recommendations": [
    {
      "action": "Improve Attendance",
      "impact": "High",
      "detail": "Current: 72%. Target: 85%+",
      "probability_gain": 24.5
    }
  ],
  "predicted_class": "Strong Performer",
  "selected_model": "Logistic Regression",
  "all_model_probs": [
    { "model": "Logistic Regression", "probability": 61.2 },
    { "model": "Decision Tree", "probability": 55.0 },
    { "model": "Random Forest", "probability": 58.1 },
    { "model": "K-Nearest Neighbors", "probability": 60.3 },
    { "model": "Gradient Boosting", "probability": 57.4 }
  ]
}
```

Field notes:

- `ml_probability` — probability from the selected model; `ensemble_probability` — soft-vote mean across all five models.
- `confidence` — % of models that agree with the predicted class (max of vote share vs. its complement).
- `class_threshold` — calibrated cutoff (Youden's J) used to turn the ensemble probability into `predicted_class`.
- `risk_thresholds` / `asi_weights` — values learned from the training data at startup.
- `recommendations[].probability_gain` — predicted probability (pts) gained by the counterfactual improvement, used to rank the top 4.

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
{ "status": "ok", "models_loaded": ["Logistic Regression", "Decision Tree", "Random Forest", "K-Nearest Neighbors", "Gradient Boosting"] }
```
