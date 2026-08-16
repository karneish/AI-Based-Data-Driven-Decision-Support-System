from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    salt = Column(String(64), nullable=False)
    name = Column(String(128), nullable=False)
    role = Column(String(32), nullable=False, default="student")
    created_at = Column(DateTime, default=datetime.utcnow)

    students = relationship("Student", back_populates="user")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    name = Column(String(128), nullable=False)
    previous_gpa = Column(Float, nullable=False, default=0.0)
    internal_score = Column(Float, nullable=False, default=0.0)
    study_hours = Column(Float, nullable=False, default=0.0)
    attendance = Column(Float, nullable=False, default=0.0)
    assignment_rate = Column(Float, nullable=False, default=0.0)
    parental_education = Column(Integer, nullable=False, default=0)
    internet_access = Column(Integer, nullable=False, default=1)
    extracurricular = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="students")
    reports = relationship(
        "Report", back_populates="student", cascade="all, delete-orphan"
    )
    interventions = relationship(
        "Intervention", back_populates="student", cascade="all, delete-orphan"
    )


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    input_snapshot = Column(JSON, nullable=False)
    result = Column(JSON, nullable=False)
    created_by = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="reports")


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    action = Column(String(255), nullable=False)
    status = Column(String(32), nullable=False, default="open")
    notes = Column(Text, default="")
    priority = Column(String(16), nullable=False, default="Medium")
    created_by = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="interventions")
