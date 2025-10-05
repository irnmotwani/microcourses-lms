from pydantic import BaseModel
from typing import Optional

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None

class CourseOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    is_approved: bool
    creator_id: int

    class Config:
        from_attributes = True
