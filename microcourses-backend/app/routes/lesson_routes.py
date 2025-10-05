from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.dependency import get_db
from app.utils.auth_jwt import get_current_user
from app.schemas.lesson_schema import LessonCreate, LessonOut
from app.controllers import lesson_controller

router = APIRouter(prefix="/lessons", tags=["Lessons"])

@router.post("/", response_model=LessonOut)
def create_lesson(lesson_in: LessonCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can add lessons")
    return lesson_controller.create_lesson(db, lesson_in.title, lesson_in.content, lesson_in.course_id)

@router.get("/course/{course_id}", response_model=list[LessonOut])
def get_lessons(course_id: int, db: Session = Depends(get_db)):
    return lesson_controller.get_lessons_by_course(db, course_id)
