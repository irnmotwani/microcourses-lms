from sqlalchemy.orm import Session
from app.models.user_model import User
from app.schemas.user_schema import UserCreate
from app.utils.hashing import hash_password

def create_user(db: Session, user_in: UserCreate):
    hashed = hash_password(user_in.password)
    user = User(email=user_in.email, name=user_in.name, role=user_in.role, password_hash=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()
