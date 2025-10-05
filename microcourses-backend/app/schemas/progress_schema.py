# app/schemas/progress_schema.py
from pydantic import BaseModel

class ProgressCreate(BaseModel):
    course_id: int
    lesson_id: int

class ProgressOut(BaseModel):
    id: int
    student_id: int
    course_id: int
    lesson_id: int
    is_completed: bool

    class Config:
        orm_mode = True

class CourseProgressOut(BaseModel):
    course_id: int
    completed_lessons: list[int]
    total_lessons: int
