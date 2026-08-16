import os
import sys

from dotenv import load_dotenv

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

load_dotenv(os.path.join(BACKEND_DIR, ".env"))

from fastapi.testclient import TestClient

from app.main import app
from app.db.database import SessionLocal
from app.db.seed import init_db

DATABASE_URL = os.getenv("DATABASE_URL", "")


def main() -> None:
    assert "postgresql" in DATABASE_URL, "DATABASE_URL must point at Neon Postgres"
    print(f"[smoke] DB host: {DATABASE_URL.split('@')[-1].split('/')[0]}")

    init_db()
    db = SessionLocal()
    try:
        from app.db.models import Student, User

        users = db.query(User).count()
        students = db.query(Student).count()
        print(f"[smoke] seeded users={users} students={students}")
        assert users == 4, f"expected 4 demo users, got {users}"
        assert students == 6, f"expected 6 students, got {students}"
    finally:
        db.close()

    client = TestClient(app)

    demo = {
        "student": "student123",
        "faculty": "faculty123",
        "admin": "admin123",
        "advisor": "advisor123",
    }
    tokens = {}
    for role, pw in demo.items():
        r = client.post("/api/login", json={"username": role, "password": pw})
        assert r.status_code == 200, f"login {role}: {r.status_code} {r.text}"
        body = r.json()
        tokens[role] = body["token"]
        print(f"[smoke] login {role} -> {body['role']} ({body['name']})")
    assert tokens["advisor"] != tokens["admin"]

    def auth(role: str) -> dict:
        return {"Authorization": f"Bearer {tokens[role]}"}

    students = client.get("/api/students", headers=auth("faculty")).json()
    print(f"[smoke] faculty sees {len(students)} students")
    sid = students[0]["id"]

    report = client.post(
        f"/api/students/{sid}/analyze", headers=auth("faculty")
    ).json()
    print(
        f"[smoke] analyze student#{sid} -> ASI {report['result']['asi']:.1f} "
        f"[{report['result']['risk_category']}]"
    )

    iv = client.post(
        "/api/interventions",
        headers=auth("advisor"),
        json={
            "student_id": sid,
            "action": "Smoke test check-in",
            "notes": "verify persistence",
            "priority": "High",
        },
    )
    assert iv.status_code == 200, f"create intervention: {iv.text}"
    iv_id = iv.json()["id"]
    print(f"[smoke] advisor created intervention#{iv_id}")

    patched = client.patch(
        f"/api/interventions/{iv_id}", headers=auth("advisor"), json={"status": "in_progress"}
    )
    assert patched.status_code == 200, f"patch: {patched.text}"
    print(f"[smoke] intervention#{iv_id} -> {patched.json()['status']}")

    users = client.get("/api/users", headers=auth("admin")).json()
    print(f"[smoke] admin lists {len(users)} users")

    deleted = client.delete(
        f"/api/interventions/{iv_id}", headers=auth("admin")
    )
    assert deleted.status_code == 204, f"delete: {deleted.text}"
    print(f"[smoke] admin deleted intervention#{iv_id}")

    signup = client.post(
        "/api/signup",
        json={"name": "Smoke Tester", "username": "smoketest_user", "password": "secret123"},
    )
    assert signup.status_code == 200, f"signup: {signup.text}"
    print(f"[smoke] signup -> {signup.json()['role']}")

    r = client.post("/api/login", json={"username": "smoketest_user", "password": "secret123"})
    assert r.status_code == 200
    print("[smoke] signup user can sign in")

    print("\n[smoke] ALL CHECKS PASSED")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        print(f"\n[smoke] FAILED: {exc}")
        sys.exit(1)
