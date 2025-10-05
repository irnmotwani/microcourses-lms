from sqlalchemy import Column, Integer, String, Boolean
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="customer")
    is_active = Column(Boolean, default=True)
