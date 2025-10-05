from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.dependency import get_db
from app.models.course_model import Course

router = APIRouter(prefix="/courses", tags=["Courses"])

# ✅ Existing routes might already be here (like create_course, etc.)

# ✅ ADD THIS NEW ROUTE:
@router.get("/approved")
def get_approved_courses(db: Session = Depends(get_db)):
    """
    Fetch all admin-approved courses for students to view.
    """
    return db.query(Course).filter(Course.is_approved == True).all()
