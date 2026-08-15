import numpy as np

from app.config import settings
from app.models import trainer
from app.schemas.analysis import StudentInput

ACTIONABLE_FEATURES = [
    {
        "field": "attendance",
        "action": "Improve Attendance",
        "delta": 10,
        "max": 100,
        "unit": "%",
        "label": "Attendance",
    },
    {
        "field": "study_hours",
        "action": "Increase Study Hours",
        "delta": 2,
        "max": 20,
        "unit": " hrs/wk",
        "label": "Study Hours",
    },
    {
        "field": "assignment_rate",
        "action": "Improve Assignment Submission",
        "delta": 10,
        "max": 100,
        "unit": "%",
        "label": "Assignment Rate",
    },
    {
        "field": "previous_gpa",
        "action": "Raise Previous GPA",
        "delta": 0.5,
        "max": 10,
        "unit": "",
        "label": "Previous GPA",
    },
    {
        "field": "internal_score",
        "action": "Strengthen Internal Scores",
        "delta": 10,
        "max": 100,
        "unit": "",
        "label": "Internal Score",
    },
    {
        "field": "extracurricular",
        "action": "Join Extracurricular Activities",
        "delta": 1,
        "max": 1,
        "unit": "",
        "label": "Extracurricular",
    },
]


def _raw_vector(data: StudentInput) -> np.ndarray:
    return np.array(
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


def build_recommendations(data: StudentInput) -> list[dict]:
    scaler = trainer.get_scaler()
    raw = _raw_vector(data)
    base_prob = float(trainer.predict_ensemble(scaler.transform(raw))[0]) * 100

    results = []
    for rule in ACTIONABLE_FEATURES:
        value = getattr(data, rule["field"])
        new_value = min(float(value) + rule["delta"], rule["max"])
        if new_value <= value:
            continue
        modified = raw.copy()
        modified[0][settings.FEATURES.index(rule["field"])] = new_value
        prob = float(trainer.predict_ensemble(scaler.transform(modified))[0]) * 100
        gain = prob - base_prob
        if gain < 1.0:
            continue
        impact = "High" if gain >= 15.0 else ("Medium" if gain >= 7.0 else "Low")
        target_txt = f"{new_value:.1f}{rule['unit']}".rstrip(".") if rule["unit"] else f"{new_value:.1f}"
        current_txt = f"{value:.1f}{rule['unit']}".rstrip(".") if rule["unit"] else f"{value:.1f}"
        results.append(
            {
                "action": rule["action"],
                "impact": impact,
                "detail": (
                    f"Raising {rule['label']} from {current_txt} to {target_txt} is predicted "
                    f"to increase success probability by {gain:.1f} pts."
                ),
                "probability_gain": round(gain, 1),
            }
        )

    results.sort(key=lambda r: r["probability_gain"], reverse=True)

    if not results:
        return [
            {
                "action": "Maintain Current Performance",
                "impact": "Low",
                "detail": "Excellent! Keep up the consistent effort.",
                "probability_gain": 0.0,
            }
        ]

    return results[:4]
