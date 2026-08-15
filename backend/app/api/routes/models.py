from fastapi import APIRouter

from app.config import settings
from app.models import trainer

router = APIRouter(tags=["models"])


@router.get("/api/model-comparison")
def model_comparison():
    return {
        "models": trainer.MODEL_COMPARISON,
        "best_model": trainer.BEST_MODEL_NAME,
        "dataset_info": {
            "total_samples": settings.DATASET_STATS["total_samples"],
            "train_samples": settings.DATASET_STATS["train_samples"],
            "test_samples": settings.DATASET_STATS["test_samples"],
            "features": len(settings.FEATURES),
            "classes": settings.DATASET_STATS["classes"],
        },
    }


@router.get("/api/feature-importance")
def feature_importance():
    return {"feature_importance": trainer.GLOBAL_FI}
