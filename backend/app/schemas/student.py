from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StudentBase(BaseModel):
    name: str
    previous_gpa: float
    internal_score: float
    study_hours: float
    attendance: float
    assignment_rate: float
    parental_education: int
    internet_access: int
    extracurricular: int


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: str | None = None
    previous_gpa: float | None = None
    internal_score: float | None = None
    study_hours: float | None = None
    attendance: float | None = None
    assignment_rate: float | None = None
    parental_education: int | None = None
    internet_access: int | None = None
    extracurricular: int | None = None


class StudentOut(StudentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int | None
    created_at: datetime
    updated_at: datetime
