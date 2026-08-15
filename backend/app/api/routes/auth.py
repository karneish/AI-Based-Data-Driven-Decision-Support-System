from fastapi import APIRouter, HTTPException

from app.schemas.auth import LoginRequest, LoginResponse
from app.services.auth import authenticate

router = APIRouter(tags=["auth"])


@router.post("/api/login", response_model=LoginResponse)
def login(req: LoginRequest) -> LoginResponse:
    user = authenticate(req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return LoginResponse(**user)
