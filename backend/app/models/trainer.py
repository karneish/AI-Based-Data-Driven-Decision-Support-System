import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
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
}


def load_and_train() -> tuple[MinMaxScaler, dict, list, str, list]:
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

    return scaler, trained, comparison, best_name, feature_importance


SCALER: MinMaxScaler | None = None
TRAINED_MODELS: dict = {}
MODEL_COMPARISON: list = []
BEST_MODEL_NAME: str = ""
GLOBAL_FI: list = []


def init() -> None:
    global SCALER, TRAINED_MODELS, MODEL_COMPARISON, BEST_MODEL_NAME, GLOBAL_FI
    print("Training models on student dataset...")
    SCALER, TRAINED_MODELS, MODEL_COMPARISON, BEST_MODEL_NAME, GLOBAL_FI = load_and_train()
    print(f"All models trained. Best: {BEST_MODEL_NAME}")


def get_scaler() -> MinMaxScaler:
    return SCALER


def get_model(name: str | None = None):
    return TRAINED_MODELS.get(name, TRAINED_MODELS.get(settings.DEFAULT_MODEL))


def get_all_models() -> dict:
    return TRAINED_MODELS


def get_feature_importance() -> list:
    return GLOBAL_FI
