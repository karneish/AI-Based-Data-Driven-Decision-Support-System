from app.models import trainer


def normalize(value: float, scale: float) -> float:
    return min(max(value / scale, 0.0), 1.0)


def compute_asi(ml_probability: float, attendance: float, study_hours: float) -> float:
    weights = trainer.get_asi_weights()
    att_norm = normalize(attendance, 100.0)
    study_norm = normalize(study_hours, 20.0)
    asi = (
        ml_probability * weights["ml_probability"]
        + att_norm * weights["attendance"]
        + study_norm * weights["study_hours"]
    )
    return min(max(asi, 0.0), 1.0)
