from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    role: Optional[str] = "customer"

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str]
    role: str

    class Config:
        orm_mode = True
