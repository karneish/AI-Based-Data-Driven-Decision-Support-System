from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import require_roles, require_user
from app.db.database import get_db
from app.db.models import Report, Student, User
from app.schemas.analysis import StudentInput
from app.schemas.report import AnalyzeStudentResponse, ReportOut
from app.schemas.student import StudentCreate, StudentOut, StudentUpdate
from app.services.analysis import build_analysis

router = APIRouter(tags=["students"])

STAFF_ROLES = ("admin", "faculty", "advisor")


def _owned_student(db: Session, student_id: int, user: User) -> Student:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if user.role not in STAFF_ROLES and student.user_id != user.id:
        raise HTTPException(status_code=403, detail="You can only access your own record")
    return student


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


@router.get("/api/students", response_model=list[StudentOut])
def list_students(
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
) -> list[Student]:
    query = db.query(Student)
    if user.role not in STAFF_ROLES:
        query = query.filter(Student.user_id == user.id)
    return query.order_by(Student.name).all()


@router.post("/api/students", response_model=StudentOut)
def create_student(
    data: StudentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "faculty")),
) -> Student:
    student = Student(**data.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.get("/api/students/{student_id}", response_model=StudentOut)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
) -> Student:
    return _owned_student(db, student_id, user)


@router.put("/api/students/{student_id}", response_model=StudentOut)
def update_student(
    student_id: int,
    data: StudentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "faculty")),
) -> Student:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(student, key, value)
    db.commit()
    db.refresh(student)
    return student


@router.delete("/api/students/{student_id}", status_code=204)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
) -> None:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()


@router.post(
    "/api/students/{student_id}/analyze", response_model=AnalyzeStudentResponse
)
def analyze_student(
    student_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
) -> AnalyzeStudentResponse:
    student = _owned_student(db, student_id, user)

    input_data = StudentInput(
        name=student.name,
        previous_gpa=student.previous_gpa,
        internal_score=student.internal_score,
        study_hours=student.study_hours,
        attendance=student.attendance,
        assignment_rate=student.assignment_rate,
        parental_education=student.parental_education,
        internet_access=student.internet_access,
        extracurricular=student.extracurricular,
    )
    result = build_analysis(input_data)
    report = Report(
        student_id=student.id,
        input_snapshot=input_data.model_dump(),
        result=result,
        created_by=user.username,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return AnalyzeStudentResponse(
        report=_report_out(db, report),
        result=result,
    )
