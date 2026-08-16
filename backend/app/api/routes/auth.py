from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import (
    get_user_by_username,
    hash_password,
    issue_token,
    require_roles,
    verify_password,
)
from app.db.database import get_db
from app.db.models import Student, User
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UserOut,
)

router = APIRouter(tags=["auth"])


def _to_auth_response(user: User) -> AuthResponse:
    token = issue_token(user.username, user.role, user.name)
    return AuthResponse(
        success=True,
        name=user.name,
        role=user.role,
        username=user.username,
        token=token,
    )


@router.post("/api/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = get_user_by_username(db, req.username.strip())
    if not user or not verify_password(req.password, user.password_hash, user.salt):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return _to_auth_response(user)


@router.post("/api/signup", response_model=AuthResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)) -> AuthResponse:
    username = req.username.strip()
    name = req.name.strip()
    if not username or not name:
        raise HTTPException(status_code=422, detail="Name and username are required")
    if len(req.password) < 6:
        raise HTTPException(
            status_code=422, detail="Password must be at least 6 characters"
        )
    if get_user_by_username(db, username):
        raise HTTPException(status_code=409, detail="Username is already taken")

    digest, salt = hash_password(req.password)
    user = User(username=username, password_hash=digest, salt=salt, name=name, role="student")
    db.add(user)
    db.flush()

    db.add(
        Student(
            user_id=user.id,
            name=name,
            previous_gpa=0.0,
            internal_score=0.0,
            study_hours=0.0,
            attendance=0.0,
            assignment_rate=0.0,
            parental_education=0,
            internet_access=0,
            extracurricular=0,
        )
    )
    db.commit()
    db.refresh(user)
    return _to_auth_response(user)


@router.get("/api/users", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
) -> list[UserOut]:
    return db.query(User).order_by(User.created_at).all()
