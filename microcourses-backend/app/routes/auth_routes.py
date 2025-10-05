from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.dependency import get_db
from app.utils.hashing import verify_password
from app.utils.auth_jwt import create_access_token
from app.controllers import user_controller

router = APIRouter(prefix="/login", tags=["Authentication"])

@router.post("/", status_code=status.HTTP_200_OK)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    🔐 User Login API
    Authenticates user with email (as username) and password.
    Returns a JWT access token on successful authentication.
    """

    # Get user by email
    user = user_controller.get_user_by_email(db, form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password (compare plain text with hashed)
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate JWT token with user info
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
        }
    }
