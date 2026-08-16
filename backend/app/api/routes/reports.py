from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import require_user
from app.db.database import get_db
from app.db.models import Report, Student, User
from app.schemas.report import ReportOut

router = APIRouter(tags=["reports"])

STAFF_ROLES = ("admin", "faculty", "advisor")


def _report_out(db: Session, report: Report) -> ReportOut:
    student = db.query(Student).filter(Student.id == report.student_id).first()
    return ReportOut(
        id=report.id,
        student_id=report.student_id,
        student_name=student.name if student else "Unknown",
        input_snapshot=report.input_snapshot,
        result=report.result,
        created_by=report.created_by,
        created_at=report.created_at,
    )


@router.get("/api/reports", response_model=list[ReportOut])
def list_reports(
    student_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
) -> list[ReportOut]:
    query = db.query(Report)
    if user.role not in STAFF_ROLES:
        linked = (
            db.query(Student.id)
            .filter(Student.user_id == user.id)
            .all()
        )
        ids = [row[0] for row in linked]
        query = query.filter(Report.student_id.in_(ids)) if ids else query.filter(False)
    if student_id is not None:
        query = query.filter(Report.student_id == student_id)
    reports = query.order_by(Report.created_at.desc()).all()
    return [_report_out(db, r) for r in reports]


@router.get("/api/reports/{report_id}", response_model=ReportOut)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
) -> ReportOut:
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if user.role not in STAFF_ROLES:
        student = db.query(Student).filter(Student.id == report.student_id).first()
        if not student or student.user_id != user.id:
            raise HTTPException(status_code=403, detail="Not your report")
    return _report_out(db, report)
