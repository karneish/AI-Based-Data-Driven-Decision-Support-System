from datetime import datetime

from pydantic import BaseModel


class ReportOut(BaseModel):
    id: int
    student_id: int
    student_name: str
    input_snapshot: dict
    result: dict
    created_by: str | None
    created_at: datetime


class AnalyzeStudentResponse(BaseModel):
    report: ReportOut
    result: dict
