from app.schemas.analysis import StudentInput


def build_radar_data(data: StudentInput) -> dict[str, float]:
    return {
        "GPA Score": round(data.previous_gpa / 10.0 * 100, 1),
        "Internal Score": round(data.internal_score, 1),
        "Study Hours": round(data.study_hours / 20.0 * 100, 1),
        "Attendance": round(data.attendance, 1),
        "Assignment Rate": round(data.assignment_rate, 1),
        "Parental Edu": round(data.parental_education / 3.0 * 100, 1),
    }


def build_bar_data(data: StudentInput) -> list[dict]:
    return [
        {"label": "GPA", "score": round(data.previous_gpa / 10.0 * 100, 1), "benchmark": 70},
        {"label": "Internal", "score": round(data.internal_score, 1), "benchmark": 70},
        {"label": "Study Hrs", "score": round(data.study_hours / 20.0 * 100, 1), "benchmark": 60},
        {"label": "Attendance", "score": round(data.attendance, 1), "benchmark": 75},
        {"label": "Assignments", "score": round(data.assignment_rate, 1), "benchmark": 80},
    ]
