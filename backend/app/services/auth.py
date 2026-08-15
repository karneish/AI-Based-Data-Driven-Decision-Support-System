from app.core.users import authenticate as validate_credentials


def authenticate(username: str, password: str) -> dict | None:
    return validate_credentials(username, password)
