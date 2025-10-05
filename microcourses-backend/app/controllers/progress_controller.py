# app/controllers/progress_controller.py
from sqlalchemy.orm import Session
from app.models.progress_model import Progress
from app.models.lesson_model import Lesson  # adjust import name if different

def mark_lesson_complete(db: Session, student_id: int, course_id: int, lesson_id: int):
    # find existing progress record
    prog = db.query(Progress).filter(
        Progress.student_id == student_id,
        Progress.course_id == course_id,
        Progress.lesson_id == lesson_id
    ).one_or_none()

    if prog:
        prog.is_completed = True
    else:
        prog = Progress(student_id=student_id, course_id=course_id, lesson_id=lesson_id, is_completed=True)
        db.add(prog)

    db.commit()
    db.refresh(prog)
    return prog

def get_progress_for_course(db: Session, student_id: int, course_id: int):
    # get total lessons in course
    total_lessons = db.query(Lesson).filter(Lesson.course_id == course_id).count()

    # get completed lesson ids
    completed = db.query(Progress).filter(
        Progress.student_id == student_id,
        Progress.course_id == course_id,
        Progress.is_completed == True
    ).all()

    completed_ids = [p.lesson_id for p in completed]

    return {
        "course_id": course_id,
        "completed_lessons": completed_ids,
        "total_lessons": total_lessons,
    }
