from pydantic import BaseModel

class LessonBase(BaseModel):
    title: str
    content: str

class LessonCreate(LessonBase):
    course_id: int

class LessonOut(LessonBase):
    id: int
    course_id: int

    class Config:
        from_attributes = True
