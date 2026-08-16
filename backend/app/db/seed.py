from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.database import Base, SessionLocal, engine
from app.db.models import Student, User

DEMO_USERS = [
    {"username": "student", "password": "student123", "name": "Arjun Sharma", "role": "student"},
    {"username": "faculty", "password": "faculty123", "name": "Prof. Meera Iyer", "role": "faculty"},
    {"username": "admin", "password": "admin123", "name": "Dr. Admin", "role": "admin"},
    {"username": "advisor", "password": "advisor123", "name": "Sara Nair", "role": "advisor"},
]

SEED_STUDENTS = [
    {
        "username": "student",
        "name": "Arjun Sharma",
        "previous_gpa": 7.5,
        "internal_score": 70,
        "study_hours": 12,
        "attendance": 85,
        "assignment_rate": 80,
        "parental_education": 2,
        "internet_access": 1,
        "extracurricular": 1,
    },
    {
        "name": "Priya Menon",
        "previous_gpa": 8.8,
        "internal_score": 84,
        "study_hours": 15,
        "attendance": 92,
        "assignment_rate": 90,
        "parental_education": 3,
        "internet_access": 1,
        "extracurricular": 1,
    },
    {
        "name": "Rahul Verma",
        "previous_gpa": 5.1,
        "internal_score": 46,
        "study_hours": 6,
        "attendance": 58,
        "assignment_rate": 42,
        "parental_education": 1,
        "internet_access": 0,
        "extracurricular": 0,
    },
    {
        "name": "Ananya Iyer",
        "previous_gpa": 6.4,
        "internal_score": 61,
        "study_hours": 10,
        "attendance": 74,
        "assignment_rate": 70,
        "parental_education": 2,
        "internet_access": 1,
        "extracurricular": 1,
    },
    {
        "name": "Karthik Rao",
        "previous_gpa": 9.1,
        "internal_score": 92,
        "study_hours": 16,
        "attendance": 97,
        "assignment_rate": 96,
        "parental_education": 3,
        "internet_access": 1,
        "extracurricular": 0,
    },
    {
        "name": "Diya Patel",
        "previous_gpa": 4.4,
        "internal_score": 38,
        "study_hours": 4,
        "attendance": 48,
        "assignment_rate": 34,
        "parental_education": 0,
        "internet_access": 0,
        "extracurricular": 0,
    },
]


def _student_fields(item: dict) -> dict:
    skip = {"username", "name"}
    return {k: v for k, v in item.items() if k not in skip}


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        for user in DEMO_USERS:
            existing = db.query(User).filter(User.username == user["username"]).first()
            if not existing:
                digest, salt = hash_password(user["password"])
                db.add(
                    User(
                        username=user["username"],
                        password_hash=digest,
                        salt=salt,
                        name=user["name"],
                        role=user["role"],
                    )
                )
        db.commit()

        for item in SEED_STUDENTS:
            existing = (
                db.query(Student).filter(Student.name == item["name"]).first()
            )
            if existing:
                continue
            user_id = None
            linked = (
                db.query(User).filter(User.username == item.get("username")).first()
            )
            user_id = linked.id if linked else None
            db.add(Student(name=item["name"], user_id=user_id, **_student_fields(item)))
        db.commit()
    finally:
        db.close()
