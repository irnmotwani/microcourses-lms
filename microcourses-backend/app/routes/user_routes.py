from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.user_schema import UserCreate, UserOut
from app.controllers import user_controller
from app.database.dependency import get_db
from app.utils.auth_jwt import get_current_user
from app.models.user_model import User

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user (Creator, Admin, or Customer).
    Only unique emails are allowed.
    """
    existing_user = user_controller.get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    created_user = user_controller.create_user(db, user_in)
    return created_user


@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Fetch current logged-in user's profile using JWT token.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "name": current_user.name
    }
