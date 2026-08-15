from fastapi import APIRouter

from app.models import trainer

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {"status": "ok", "models_loaded": list(trainer.TRAINED_MODELS.keys())}
