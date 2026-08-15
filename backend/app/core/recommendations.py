from app.schemas.analysis import StudentInput

RECOMMENDATION_RULES = [
    {
        "field": "attendance",
        "threshold": 75,
        "action": "Improve Attendance",
        "impact": "High",
        "detail": lambda v: f"Current: {v:.0f}%. Target: 85%+",
    },
    {
        "field": "study_hours",
        "threshold": 10,
        "action": "Increase Study Hours",
        "impact": "High",
        "detail": lambda v: f"Current: {v:.1f} hrs/week. Target: 12+ hrs",
    },
    {
        "field": "assignment_rate",
        "threshold": 75,
        "action": "Improve Assignment Submission",
        "impact": "Medium",
        "detail": lambda v: f"Current: {v:.0f}%. Target: 90%+",
    },
    {
        "field": "previous_gpa",
        "threshold": 6.0,
        "action": "Focus on GPA Improvement",
        "impact": "High",
        "detail": lambda v: f"Previous GPA: {v:.1f}. Target: 7.0+",
    },
    {
        "field": "internal_score",
        "threshold": 60,
        "action": "Strengthen Internal Scores",
        "impact": "Medium",
        "detail": lambda v: f"Current: {v:.0f}. Target: 70+",
    },
]


def build_recommendations(data: StudentInput) -> list[dict]:
    recs = []
    for rule in RECOMMENDATION_RULES:
        value = getattr(data, rule["field"])
        if value < rule["threshold"]:
            recs.append(
                {
                    "action": rule["action"],
                    "impact": rule["impact"],
                    "detail": rule["detail"](value),
                }
            )
    if not data.extracurricular:
        recs.append(
            {
                "action": "Join Extracurricular Activities",
                "impact": "Low",
                "detail": "Improves engagement and holistic development",
            }
        )
    if not recs:
        recs.append(
            {
                "action": "Maintain Current Performance",
                "impact": "Low",
                "detail": "Excellent! Keep up the consistent effort.",
            }
        )
    return recs
