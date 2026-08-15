from app.config import settings


def classify_risk(asi: float) -> tuple[str, str]:
    if asi >= settings.RISK_STABLE_THRESHOLD:
        return "Stable", "green"
    if asi >= settings.RISK_MONITOR_THRESHOLD:
        return "Monitor Closely", "amber"
    return "Intervention Required", "red"
