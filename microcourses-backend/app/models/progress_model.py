# app/models/progress_model.py
from sqlalchemy import Column, Integer, Boolean, ForeignKey, UniqueConstraint
from app.database.connection import Base

class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)

    # prevent duplicate entries for same student-course-lesson
    __table_args__ = (UniqueConstraint("student_id", "course_id", "lesson_id", name="uix_progress"),)
