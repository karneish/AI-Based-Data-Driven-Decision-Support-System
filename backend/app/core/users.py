USERS = {
    "student": {"password": "student123", "name": "Arjun Sharma", "role": "student"},
    "student1": {"password": "pass123", "name": "Arjun Sharma", "role": "student"},
    "student2": {"password": "pass123", "name": "Priya Menon", "role": "student"},
    "karneish": {"password": "pass123", "name": "Karneish", "role": "student"},
    "faculty": {
        "password": "faculty123",
        "name": "Prof. Meera Iyer",
        "role": "faculty",
    },
    "admin": {"password": "admin123", "name": "Dr. Admin", "role": "admin"},
    "advisor": {"password": "advisor123", "name": "Karneish", "role": "advisor"},
}


def authenticate(username: str, password: str) -> dict | None:
    user = USERS.get(username)
    if not user or user["password"] != password:
        return None
    return {
        "success": True,
        "name": user["name"],
        "role": user["role"],
        "username": username,
    }
