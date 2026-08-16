from fastapi import APIRouter

from app.api.routes import (
    analysis,
    auth,
    health,
    interventions,
    models,
    reports,
    students,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(analysis.router)
api_router.include_router(students.router)
api_router.include_router(reports.router)
api_router.include_router(interventions.router)
api_router.include_router(models.router)
api_router.include_router(health.router)
