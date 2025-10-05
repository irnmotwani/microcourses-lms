# app/routes/progress_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.dependency import get_db
from app.utils.auth_jwt import get_current_user
from app.schemas.progress_schema import ProgressCreate, ProgressOut, CourseProgressOut
from app.controllers import progress_controller

router = APIRouter(prefix="/students/progress", tags=["Progress"])

@router.post("/complete", response_model=ProgressOut, status_code=status.HTTP_200_OK)
def complete_lesson(payload: ProgressCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # only student role allowed (adjust if you also want creators/admin update)
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can mark lessons completed")

    prog = progress_controller.mark_lesson_complete(
        db, student_id=current_user.id, course_id=payload.course_id, lesson_id=payload.lesson_id
    )
    return prog

@router.get("/{course_id}", response_model=CourseProgressOut)
def get_course_progress(course_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can view their progress")

    result = progress_controller.get_progress_for_course(db, student_id=current_user.id, course_id=course_id)
    return result
