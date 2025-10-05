from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    creator_id = Column(Integer, ForeignKey("users.id"))
    
    # ✅ Add this column for Admin Approval
    is_approved = Column(Boolean, default=False)  # False = Pending, True = Approved
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")

    creator = relationship("User")
