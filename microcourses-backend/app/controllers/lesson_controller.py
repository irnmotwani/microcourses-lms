from sqlalchemy.orm import Session
from app.models.lesson_model import Lesson

def create_lesson(db: Session, title: str, content: str, course_id: int):
    lesson = Lesson(title=title, content=content, course_id=course_id)
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson

def get_lessons_by_course(db: Session, course_id: int):
    return db.query(Lesson).filter(Lesson.course_id == course_id).all()
