from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from datetime import datetime
import os

from app.database.dependency import get_db
from app.models.user_model import User
from app.models.course_model import Course
from app.models.progress_model import Progress
from app.models.lesson_model import Lesson
from app.utils.auth_jwt import get_current_user

router = APIRouter(prefix="/students", tags=["Certificate"])

@router.get("/certificate/{course_id}")
def generate_certificate(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    ✅ Generate and return a course completion certificate as a downloadable PDF.
    """
    # Only students can download certificates
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can download certificates")

    # Check if the course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check if the student has completed all lessons
    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).all()
    total_lessons = len(lessons)
    completed = (
        db.query(Progress)
        .filter(
            Progress.student_id == current_user.id,
            Progress.course_id == course_id,
            Progress.is_completed == True
        )
        .count()
    )

    if total_lessons == 0 or completed < total_lessons:
        raise HTTPException(status_code=400, detail="Course not fully completed yet")

    # 📜 Create certificate directory if not exists
    cert_dir = "certificates"
    os.makedirs(cert_dir, exist_ok=True)
    file_path = os.path.join(cert_dir, f"certificate_{current_user.id}_{course_id}.pdf")

    # 🖋️ Generate the PDF
    c = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width / 2, height - 150, "Certificate of Completion")

    c.setFont("Helvetica", 18)
    c.drawCentredString(width / 2, height - 220, f"This is to certify that")
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width / 2, height - 260, f"{current_user.email}")

    c.setFont("Helvetica", 18)
    c.drawCentredString(width / 2, height - 300, f"has successfully completed the course:")
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width / 2, height - 340, f"{course.title}")

    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2, height - 400, f"Completion Date: {datetime.now().strftime('%d %B %Y')}")

    c.setFont("Helvetica-Oblique", 12)
    c.drawCentredString(width / 2, 100, "🎓 MicroCourses Platform")

    c.showPage()
    c.save()

    # ✅ Return file as downloadable response
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=f"Certificate_{course.title}.pdf"
    )
