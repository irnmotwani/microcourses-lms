# app/models/enrollment.py
from sqlalchemy import Column, Integer, ForeignKey, Boolean
from app.database.connection import Base

class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    completed = Column(Boolean, default=False)
