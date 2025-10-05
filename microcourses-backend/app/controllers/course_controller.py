from sqlalchemy.orm import Session
from app.models.course_model import Course

def create_course(db: Session, title: str, description: str, creator_id: int):
    course = Course(title=title, description=description, creator_id=creator_id)
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

def get_all_courses(db: Session):
    return db.query(Course).all()

def get_courses_by_creator(db: Session, creator_id: int):
    return db.query(Course).filter(Course.creator_id == creator_id).all()

def approve_course(db: Session, course_id: int):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return None
    course.is_approved = True
    db.commit()
    db.refresh(course)
    return course
