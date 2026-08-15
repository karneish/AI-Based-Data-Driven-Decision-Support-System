from fastapi import APIRouter

from app.api.routes import analysis, auth, health, models

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(analysis.router)
api_router.include_router(models.router)
api_router.include_router(health.router)
