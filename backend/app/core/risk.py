from app.models import trainer


def classify_risk(asi: float) -> tuple[str, str]:
    thresholds = trainer.get_risk_thresholds()
    if asi >= thresholds["stable"]:
        return "Stable", "green"
    if asi >= thresholds["monitor"]:
        return "Monitor Closely", "amber"
    return "Intervention Required", "red"


def get_risk_thresholds() -> dict:
    return trainer.get_risk_thresholds()
