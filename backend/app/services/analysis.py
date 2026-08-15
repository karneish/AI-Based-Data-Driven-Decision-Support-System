import numpy as np

from app.config import settings
from app.core.asi import compute_asi
from app.core.recommendations import build_recommendations
from app.core.risk import classify_risk, get_risk_thresholds
from app.core.visuals import build_bar_data, build_radar_data
from app.models import trainer
from app.schemas.analysis import StudentInput


def build_analysis(data: StudentInput, model_name: str = settings.DEFAULT_MODEL) -> dict:
    raw_features = np.array(
        [
            [
                data.previous_gpa,
                data.internal_score,
                data.study_hours,
                data.attendance,
                data.assignment_rate,
                float(data.parental_education),
                float(data.internet_access),
                float(data.extracurricular),
            ]
        ]
    )

    features_scaled = trainer.get_scaler().transform(raw_features)

    all_probs = trainer.predict_all(features_scaled)[0]
    ensemble_prob = float(all_probs.mean())
    class_threshold = trainer.get_class_threshold()

    clf = trainer.get_model(model_name)
    ml_prob = float(clf.predict_proba(features_scaled)[0][1])

    votes_strong = float((all_probs >= class_threshold).mean()) * 100
    confidence = round(max(votes_strong, 100 - votes_strong), 1)

    asi_score = compute_asi(ensemble_prob, data.attendance, data.study_hours)
    risk, risk_color = classify_risk(asi_score)

    model_probs = [
        {
            "model": name,
            "probability": round(float(prob) * 100, 2),
        }
        for name, prob in zip(trainer.get_all_models().keys(), all_probs)
    ]

    return {
        "ml_probability": round(ml_prob * 100, 2),
        "ensemble_probability": round(ensemble_prob * 100, 2),
        "confidence": confidence,
        "class_threshold": round(class_threshold * 100, 2),
        "asi": round(asi_score * 100, 2),
        "risk_category": risk,
        "risk_color": risk_color,
        "risk_thresholds": get_risk_thresholds(),
        "asi_weights": trainer.get_asi_weights(),
        "feature_importance": trainer.get_feature_importance(),
        "radar_data": build_radar_data(data),
        "bar_data": build_bar_data(data),
        "recommendations": build_recommendations(data),
        "predicted_class": (
            "Strong Performer" if ensemble_prob >= class_threshold else "Needs Improvement"
        ),
        "selected_model": model_name,
        "all_model_probs": model_probs,
    }
