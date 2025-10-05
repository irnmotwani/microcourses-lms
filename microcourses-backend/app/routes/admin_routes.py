from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.dependency import get_db
from app.models.course_model import Course
from app.models.user_model import User
from app.models.enrollment import Enrollment
from app.utils.auth_jwt import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])

# 🔒 Only Admins Allowed
def admin_only(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this resource")
    return current_user


# ✅ Get all pending courses (is_approved = False)
@router.get("/review/courses")
def review_courses(db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    pending_courses = db.query(Course).filter(Course.is_approved == False).all()
    return pending_courses


# ✅ Approve a course
@router.put("/approve/{course_id}")
def approve_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    course.is_approved = True
    db.commit()
    db.refresh(course)
    return {"message": f"✅ Course '{course.title}' approved successfully!"}


# ✅ Get list of all users
@router.get("/users")
def list_users(db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    users = db.query(User).all()
    return [
        {"id": user.id, "email": user.email, "role": user.role}
        for user in users
    ]


# ✅ Update user role
@router.put("/users/{user_id}")
def update_user_role(
    user_id: int,
    role_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    new_role = role_data.get("role")
    if new_role not in ["admin", "creator", "student"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = new_role
    db.commit()
    db.refresh(user)
    return {"message": f"✅ Updated role to '{new_role}'", "user": {"id": user.id, "email": user.email, "role": user.role}}


# ✅ Dashboard Overview Stats
@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    total_users = db.query(User).count()
    total_courses = db.query(Course).count()
    approved_courses = db.query(Course).filter(Course.is_approved == True).count()
    total_enrollments = db.query(Enrollment).count()

    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "approved_courses": approved_courses,
        "total_enrollments": total_enrollments,
    }
