from datetime import datetime

from pydantic import BaseModel


class InterventionCreate(BaseModel):
    student_id: int
    action: str
    notes: str = ""
    priority: str = "Medium"


class InterventionUpdate(BaseModel):
    action: str | None = None
    status: str | None = None
    notes: str | None = None
    priority: str | None = None


class InterventionOut(BaseModel):
    id: int
    student_id: int
    student_name: str
    action: str
    status: str
    notes: str
    priority: str
    created_by: str | None
    created_at: datetime
    updated_at: datetime
