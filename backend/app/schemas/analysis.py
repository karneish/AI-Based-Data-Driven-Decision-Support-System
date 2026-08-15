from pydantic import BaseModel


class StudentInput(BaseModel):
    name: str
    previous_gpa: float
    internal_score: float
    study_hours: float
    attendance: float
    assignment_rate: float
    parental_education: int
    internet_access: int
    extracurricular: int
