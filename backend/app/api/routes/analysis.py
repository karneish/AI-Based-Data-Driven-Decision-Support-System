from fastapi import APIRouter

from app.schemas.analysis import StudentInput
from app.services.analysis import build_analysis

router = APIRouter(tags=["analysis"])


@router.post("/api/analyze")
def analyze(data: StudentInput):
    return build_analysis(data)


@router.post("/api/simulate")
def simulate(data: StudentInput):
    return build_analysis(data)
