from tests.conftest import client


def _auth(username: str, password: str) -> str:
    resp = client.post("/api/login", json={"username": username, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()["token"]


def _headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_login_all_demo_roles():
    cases = [
        ("student", "student123", "student"),
        ("faculty", "faculty123", "faculty"),
        ("admin", "admin123", "admin"),
        ("advisor", "advisor123", "advisor"),
    ]
    for username, password, role in cases:
        resp = client.post("/api/login", json={"username": username, "password": password})
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["success"] is True
        assert body["role"] == role
        assert body["username"] == username
        assert body["token"]


def test_login_failure():
    resp = client.post(
        "/api/login", json={"username": "student", "password": "wrong"}
    )
    assert resp.status_code == 401


def test_signup_then_login():
    username = "new_student"
    resp = client.post(
        "/api/signup",
        json={"name": "New Student", "username": username, "password": "secret123"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["role"] == "student"
    assert body["token"]

    resp = client.post("/api/login", json={"username": username, "password": "secret123"})
    assert resp.status_code == 200
    assert resp.json()["role"] == "student"


def test_signup_duplicate_username():
    payload = {"name": "Dup", "username": "dup_user", "password": "secret123"}
    first = client.post("/api/signup", json=payload)
    assert first.status_code == 200
    second = client.post("/api/signup", json=payload)
    assert second.status_code == 409


def test_signup_short_password():
    resp = client.post(
        "/api/signup", json={"name": "X", "username": "x_user", "password": "123"}
    )
    assert resp.status_code == 422


def test_students_list():
    token = _auth("faculty", "faculty123")
    resp = client.get("/api/students", headers=_headers(token))
    assert resp.status_code == 200
    names = [s["name"] for s in resp.json()]
    assert "Arjun Sharma" in names
    assert "Priya Menon" in names


def test_student_role_sees_only_own():
    token = _auth("student", "student123")
    resp = client.get("/api/students", headers=_headers(token))
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["name"] == "Arjun Sharma"


def test_create_student_requires_staff():
    token = _auth("student", "student123")
    payload = {
        "name": "Hacker Kid",
        "previous_gpa": 7.0,
        "internal_score": 60,
        "study_hours": 8,
        "attendance": 70,
        "assignment_rate": 65,
        "parental_education": 2,
        "internet_access": 1,
        "extracurricular": 1,
    }
    resp = client.post("/api/students", json=payload, headers=_headers(token))
    assert resp.status_code == 403


def test_student_crud_flow():
    admin = _auth("admin", "admin123")
    faculty = _auth("faculty", "faculty123")
    payload = {
        "name": "Test Student",
        "previous_gpa": 6.5,
        "internal_score": 55,
        "study_hours": 9,
        "attendance": 66,
        "assignment_rate": 60,
        "parental_education": 1,
        "internet_access": 1,
        "extracurricular": 0,
    }

    created = client.post("/api/students", json=payload, headers=_headers(faculty))
    assert created.status_code == 200, created.text
    sid = created.json()["id"]

    updated = client.put(
        f"/api/students/{sid}",
        json={"attendance": 80},
        headers=_headers(faculty),
    )
    assert updated.status_code == 200
    assert updated.json()["attendance"] == 80

    fetched = client.get(f"/api/students/{sid}", headers=_headers(admin))
    assert fetched.status_code == 200
    assert fetched.json()["name"] == "Test Student"

    deleted = client.delete(f"/api/students/{sid}", headers=_headers(admin))
    assert deleted.status_code == 204

    gone = client.get(f"/api/students/{sid}", headers=_headers(admin))
    assert gone.status_code == 404


def test_analyze_student_persists_report():
    token = _auth("advisor", "advisor123")
    students = client.get("/api/students", headers=_headers(token)).json()
    target = next(s for s in students if s["name"] == "Rahul Verma")

    resp = client.post(
        f"/api/students/{target['id']}/analyze", headers=_headers(token)
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["report"]["student_id"] == target["id"]
    assert "asi" in body["result"]
    assert "risk_category" in body["result"]

    reports = client.get("/api/reports", headers=_headers(token)).json()
    assert len(reports) >= 1
    assert reports[0]["student_name"] == "Rahul Verma"


def test_analyze_student_student_role_own_only():
    student = _auth("student", "student123")
    advisor = _auth("advisor", "advisor123")
    students = client.get("/api/students", headers=_headers(advisor)).json()
    other = next(s for s in students if s["name"] == "Priya Menon")

    forbidden = client.post(
        f"/api/students/{other['id']}/analyze", headers=_headers(student)
    )
    assert forbidden.status_code == 403


def test_interventions_flow():
    advisor = _auth("advisor", "advisor123")
    admin = _auth("admin", "admin123")
    students = client.get("/api/students", headers=_headers(advisor)).json()
    at_risk = next(s for s in students if s["name"] == "Rahul Verma")

    created = client.post(
        "/api/interventions",
        json={
            "student_id": at_risk["id"],
            "action": "Raise attendance above 80%",
            "notes": "Weekly check-in",
            "priority": "High",
        },
        headers=_headers(advisor),
    )
    assert created.status_code == 200, created.text
    iid = created.json()["id"]
    assert created.json()["status"] == "open"

    patched = client.patch(
        f"/api/interventions/{iid}",
        json={"status": "in_progress"},
        headers=_headers(advisor),
    )
    assert patched.status_code == 200
    assert patched.json()["status"] == "in_progress"

    listing = client.get("/api/interventions", headers=_headers(advisor)).json()
    assert any(i["id"] == iid for i in listing)

    deleted = client.delete(f"/api/interventions/{iid}", headers=_headers(admin))
    assert deleted.status_code == 204


def test_interventions_deny_student():
    student = _auth("student", "student123")
    resp = client.get("/api/interventions", headers=_headers(student))
    assert resp.status_code == 403


def test_users_list_admin_only():
    admin = _auth("admin", "admin123")
    student = _auth("student", "student123")

    denied = client.get("/api/users", headers=_headers(student))
    assert denied.status_code == 403

    allowed = client.get("/api/users", headers=_headers(admin))
    assert allowed.status_code == 200
    usernames = [u["username"] for u in allowed.json()]
    assert "student" in usernames
    assert "admin" in usernames


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
    assert "ensemble_probability" in body
    assert "confidence" in body
    for rec in body["recommendations"]:
        assert "probability_gain" in rec


def test_model_comparison():
    resp = client.get("/api/model-comparison")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["models"]) == 5
    assert body["best_model"] in {m["model"] for m in body["models"]}
