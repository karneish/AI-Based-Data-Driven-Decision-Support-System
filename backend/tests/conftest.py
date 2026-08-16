import os
import tempfile
from pathlib import Path

_tmp_db = Path(tempfile.mkdtemp()) / "test_dss.db"
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp_db}"
os.environ["APP_DEBUG"] = "false"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

client = TestClient(app)


@pytest.fixture(autouse=True)
def _clean_reports():
    from app.db.database import SessionLocal
    from app.db.models import Intervention, Report

    db = SessionLocal()
    try:
        db.query(Intervention).delete()
        db.query(Report).delete()
        db.commit()
    finally:
        db.close()
    yield
