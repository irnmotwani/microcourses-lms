from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.database.dependency import get_db
from app.models.course_model import Course
from app.models.user_model import User
from app.models.enrollment import Enrollment
from app.models.lesson_model import Lesson
from app.models.progress_model import Progress
from app.utils.auth_jwt import get_current_user

router = APIRouter(prefix="/students", tags=["Students"])


# ✅ Request Schemas
class EnrollRequest(BaseModel):
    course_id: int


class CompleteLessonRequest(BaseModel):
    lesson_id: int


# ✅ Enroll in a Course
@router.post("/enroll")
def enroll_in_course(
    payload: EnrollRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can enroll in courses")

    # Check if course exists and is approved
    course = (
        db.query(Course)
        .filter(Course.id == payload.course_id, Course.is_approved == True)
        .first()
    )
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or not approved")

    # Check if already enrolled
    existing = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == payload.course_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    # Enroll student
    enrollment = Enrollment(student_id=current_user.id, course_id=payload.course_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return {"message": f"✅ Enrolled in '{course.title}' successfully!", "course_id": course.id}


# ✅ Get All Enrolled Courses
@router.get("/enrollments")
def get_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can view enrolled courses")

    enrollments = db.query(Enrollment).filter(Enrollment.student_id == current_user.id).all()
    result = []
    for e in enrollments:
        course = db.query(Course).filter(Course.id == e.course_id).first()
        if course:
            result.append(
                {
                    "id": course.id,
                    "title": course.title,
                    "description": course.description,
                    "is_approved": course.is_approved,
                }
            )
    return result


# ✅ Get Course Progress
@router.get("/progress/{course_id}")
def get_course_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can view progress")

    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).all()
    total_lessons = len(lessons)

    completed = (
        db.query(Progress)
        .filter(
            Progress.student_id == current_user.id,
            Progress.lesson_id.in_([lesson.id for lesson in lessons]),
            Progress.is_completed == True,
        )
        .all()
    )

    return {
        "course_id": course_id,
        "total_lessons": total_lessons,
        "completed_lessons": [p.lesson_id for p in completed],
    }


# ✅ Mark a Lesson as Completed
@router.post("/complete-lesson")
def complete_lesson(
    payload: CompleteLessonRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can complete lessons")

    # Validate lesson exists
    lesson = db.query(Lesson).filter(Lesson.id == payload.lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Ensure student is enrolled in the course containing this lesson
    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == lesson.course_id,
        )
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=403, detail="You are not enrolled in this course")

    # Check if lesson already marked completed
    existing = (
        db.query(Progress)
        .filter(
            Progress.student_id == current_user.id,
            Progress.lesson_id == payload.lesson_id,
        )
        .first()
    )

    if existing and existing.is_completed:
        return {"message": "✅ Lesson already marked as completed"}

    if existing:
        existing.is_completed = True
    else:
        progress = Progress(
    student_id=current_user.id,
    course_id=lesson.course_id,  # ✅ Fix: include course_id
    lesson_id=payload.lesson_id,
    is_completed=True,
   )
    db.add(progress)


    db.commit()

    return {"message": f"🎉 Lesson '{lesson.title}' marked as completed successfully!"}
