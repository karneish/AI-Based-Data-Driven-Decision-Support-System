from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_login_success():
    resp = client.post(
        "/api/login", json={"username": "karneish", "password": "pass123"}
    )
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    assert resp.json()["name"] == "Karneish"


def test_login_failure():
    resp = client.post(
        "/api/login", json={"username": "karneish", "password": "wrong"}
    )
    assert resp.status_code == 401


def test_analyze():
    payload = {
        "name": "Test Student",
        "previous_gpa": 7.5,
        "internal_score": 70,
        "study_hours": 10,
        "attendance": 80,
        "assignment_rate": 85,
        "parental_education": 2,
        "internet_access": 1,
        "extracurricular": 1,
    }
    resp = client.post("/api/analyze", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert "asi" in body
    assert "risk_category" in body
    assert "recommendations" in body


def test_model_comparison():
    resp = client.get("/api/model-comparison")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["models"]) == 4
    assert body["best_model"] in {m["model"] for m in body["models"]}
