USERS = {
    "admin": {"password": "admin123", "name": "Dr. Admin", "role": "advisor"},
    "student1": {"password": "pass123", "name": "Arjun Sharma", "role": "student"},
    "student2": {"password": "pass123", "name": "Priya Menon", "role": "student"},
    "karneish": {"password": "pass123", "name": "Karneish", "role": "student"},
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
