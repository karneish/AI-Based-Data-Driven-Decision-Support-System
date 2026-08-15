import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import MinMaxScaler
from sklearn.tree import DecisionTreeClassifier

from app.config import settings

MODEL_FACTORIES = {
    "Logistic Regression": lambda: LogisticRegression(max_iter=500, random_state=42),
    "Decision Tree": lambda: DecisionTreeClassifier(max_depth=6, random_state=42),
    "Random Forest": lambda: RandomForestClassifier(n_estimators=100, random_state=42),
    "K-Nearest Neighbors": lambda: KNeighborsClassifier(n_neighbors=7),
    "Gradient Boosting": lambda: HistGradientBoostingClassifier(random_state=42),
}


def _youden_cutoff(y_true: np.ndarray, y_proba: np.ndarray) -> float:
    fpr, tpr, thresholds = roc_curve(y_true, y_proba)
    j_scores = tpr - fpr
    best = int(np.argmax(j_scores))
    while best < len(thresholds) and not np.isfinite(thresholds[best]):
        best += 1
    if best >= len(thresholds):
        return 0.5
    return float(thresholds[best])


def load_and_train() -> tuple:
    df = pd.read_csv(settings.DATASET_PATH)

    X = df[settings.FEATURES].values
    y = df["performance_label"].values

    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    trained = {}
    comparison = []

    for name, factory in MODEL_FACTORIES.items():
        clf = factory()
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        y_proba = clf.predict_proba(X_test)[:, 1]

        comparison.append(
            {
                "model": name,
                "accuracy": round(accuracy_score(y_test, y_pred) * 100, 2),
                "precision": round(precision_score(y_test, y_pred, zero_division=0) * 100, 2),
                "recall": round(recall_score(y_test, y_pred, zero_division=0) * 100, 2),
                "f1_score": round(f1_score(y_test, y_pred, zero_division=0) * 100, 2),
                "auc": round(roc_auc_score(y_test, y_proba) * 100, 2),
                "cv_score": round(
                    cross_val_score(clf, X_scaled, y, cv=5, scoring="accuracy").mean() * 100, 2
                ),
                "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
            }
        )
        trained[name] = clf

    best_name = max(comparison, key=lambda x: x["accuracy"])["model"]

    train_probs = np.column_stack(
        [trained[name].predict_proba(X_train)[:, 1] for name in trained]
    )
    test_probs = np.column_stack(
        [trained[name].predict_proba(X_test)[:, 1] for name in trained]
    )

    ensemble_train = train_probs.mean(axis=1)
    ensemble_test = test_probs.mean(axis=1)

    class_threshold = _youden_cutoff(y_test, ensemble_test)

    asi_cal = LogisticRegression(max_iter=500)
    asi_cal.fit(
        np.column_stack([ensemble_train, X_train[:, 3], X_train[:, 2]]), y_train
    )
    coeffs = np.abs(asi_cal.coef_[0])
    asi_weights = {
        "ml_probability": float(coeffs[0] / coeffs.sum()),
        "attendance": float(coeffs[1] / coeffs.sum()),
        "study_hours": float(coeffs[2] / coeffs.sum()),
    }

    asi_train = (
        ensemble_train * asi_weights["ml_probability"]
        + X_train[:, 3] * asi_weights["attendance"]
        + X_train[:, 2] * asi_weights["study_hours"]
    )
    asi_cutoff = _youden_cutoff(y_train, asi_train)
    margin = 0.08
    risk_thresholds = {
        "stable": float(min(asi_cutoff + margin, 0.95)),
        "monitor": float(max(asi_cutoff - margin, 0.05)),
    }

    rf_imp = trained["Random Forest"].feature_importances_
    feature_importance = sorted(
        (
            {
                "feature": settings.FEATURE_LABELS[i],
                "importance": round(float(rf_imp[i]), 4),
            }
            for i in range(len(settings.FEATURES))
        ),
        key=lambda x: x["importance"],
        reverse=True,
    )

    return (
        scaler,
        trained,
        comparison,
        best_name,
        feature_importance,
        class_threshold,
        asi_weights,
        risk_thresholds,
    )


SCALER: MinMaxScaler | None = None
TRAINED_MODELS: dict = {}
MODEL_COMPARISON: list = []
BEST_MODEL_NAME: str = ""
GLOBAL_FI: list = []
CLASS_THRESHOLD: float = 0.5
ASI_WEIGHTS: dict = {}
RISK_THRESHOLDS: dict = {}


def init() -> None:
    global SCALER, TRAINED_MODELS, MODEL_COMPARISON, BEST_MODEL_NAME, GLOBAL_FI
    global CLASS_THRESHOLD, ASI_WEIGHTS, RISK_THRESHOLDS
    print("Training models on student dataset...")
    (
        SCALER,
        TRAINED_MODELS,
        MODEL_COMPARISON,
        BEST_MODEL_NAME,
        GLOBAL_FI,
        CLASS_THRESHOLD,
        ASI_WEIGHTS,
        RISK_THRESHOLDS,
    ) = load_and_train()
    print(f"All models trained. Best: {BEST_MODEL_NAME} | class threshold: {CLASS_THRESHOLD:.3f}")


def get_scaler() -> MinMaxScaler:
    return SCALER


def get_model(name: str | None = None):
    return TRAINED_MODELS.get(name, TRAINED_MODELS.get(settings.DEFAULT_MODEL))


def get_all_models() -> dict:
    return TRAINED_MODELS


def get_feature_importance() -> list:
    return GLOBAL_FI


def get_class_threshold() -> float:
    return CLASS_THRESHOLD


def get_asi_weights() -> dict:
    return ASI_WEIGHTS or settings.ASI_WEIGHTS


def get_risk_thresholds() -> dict:
    return RISK_THRESHOLDS or {
        "stable": settings.RISK_STABLE_THRESHOLD,
        "monitor": settings.RISK_MONITOR_THRESHOLD,
    }


def predict_all(X_scaled: np.ndarray) -> np.ndarray:
    return np.column_stack(
        [model.predict_proba(X_scaled)[:, 1] for model in TRAINED_MODELS.values()]
    )


def predict_ensemble(X_scaled: np.ndarray) -> np.ndarray:
    return predict_all(X_scaled).mean(axis=1)
