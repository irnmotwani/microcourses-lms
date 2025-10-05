from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)

    # Relationship
    course = relationship("Course", back_populates="lessons")
