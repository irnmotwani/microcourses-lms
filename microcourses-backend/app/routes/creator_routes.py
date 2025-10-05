from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.utils.role_checker import role_required
from app.database.dependency import get_db
from app.utils.auth_jwt import get_current_user
from app.models.course_model import Course
from app.models.user_model import User
from app.schemas.course_schema import CourseCreate, CourseOut
from app.controllers import course_controller

router = APIRouter(prefix="/creator", tags=["Creator"])


@router.post("/apply", dependencies=[Depends(role_required("creator"))])
def apply_for_course():
    return {"message": "✅ Creator verified successfully. You can now create a course."}


@router.post("/courses", response_model=CourseOut)
def create_course(
    course_in: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can upload courses")

    course = course_controller.create_course(
        db,
        title=course_in.title,
        description=course_in.description,
        creator_id=current_user.id,
    )

    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "status": "Approved" if course.is_approved else "Pending"
    }


@router.get("/my-courses")
def my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can view their courses")

    courses = db.query(Course).filter(Course.creator_id == current_user.id).all()

    formatted_courses = [
        {
            "id": course.id,
            "title": course.title,
            "description": course.description,
            # 👇 Return a proper string status field
            "status": "Approved" if course.is_approved else "Pending"
        }
        for course in courses
    ]

    return formatted_courses
