from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import require_roles, require_user
from app.db.database import get_db
from app.db.models import Intervention, Student, User
from app.schemas.intervention import (
    InterventionCreate,
    InterventionOut,
    InterventionUpdate,
)

router = APIRouter(tags=["interventions"])

MANAGER_ROLES = ("admin", "advisor")
VIEWER_ROLES = ("admin", "advisor", "faculty")

ALLOWED_STATUS = {"open", "in_progress", "done"}
ALLOWED_PRIORITY = {"High", "Medium", "Low"}


def _to_out(db: Session, item: Intervention) -> InterventionOut:
    student = db.query(Student).filter(Student.id == item.student_id).first()
    return InterventionOut(
        id=item.id,
        student_id=item.student_id,
        student_name=student.name if student else "Unknown",
        action=item.action,
        status=item.status,
        notes=item.notes or "",
        priority=item.priority,
        created_by=item.created_by,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


@router.get("/api/interventions", response_model=list[InterventionOut])
def list_interventions(
    student_id: int | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*VIEWER_ROLES)),
) -> list[InterventionOut]:
    query = db.query(Intervention)
    if student_id is not None:
        query = query.filter(Intervention.student_id == student_id)
    items = query.order_by(Intervention.created_at.desc()).all()
    return [_to_out(db, item) for item in items]


@router.post("/api/interventions", response_model=InterventionOut)
def create_intervention(
    data: InterventionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(*MANAGER_ROLES)),
) -> InterventionOut:
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    status = "open"
    priority = data.priority if data.priority in ALLOWED_PRIORITY else "Medium"
    item = Intervention(
        student_id=data.student_id,
        action=data.action.strip(),
        notes=data.notes,
        status=status,
        priority=priority,
        created_by=user.username,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return _to_out(db, item)


@router.patch("/api/interventions/{intervention_id}", response_model=InterventionOut)
def update_intervention(
    intervention_id: int,
    data: InterventionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*MANAGER_ROLES)),
) -> InterventionOut:
    item = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Intervention not found")
    updates = data.model_dump(exclude_unset=True)
    if "status" in updates and updates["status"] not in ALLOWED_STATUS:
        raise HTTPException(status_code=422, detail="Invalid status")
    if "priority" in updates and updates["priority"] not in ALLOWED_PRIORITY:
        raise HTTPException(status_code=422, detail="Invalid priority")
    for key, value in updates.items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return _to_out(db, item)


@router.delete("/api/interventions/{intervention_id}", status_code=204)
def delete_intervention(
    intervention_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
) -> None:
    item = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Intervention not found")
    db.delete(item)
    db.commit()
